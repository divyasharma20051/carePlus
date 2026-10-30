
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getError } from '../api';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Alert } from '../lib/pageImports';

export default function AppointmentPage({ user }) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');

  const [values, setValues] = useState({
    patientName: user?.name || '',
    phone: '',
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    doctor: '',
  });

  useEffect(() => {
    let active = true;

    api
      .get('/doctors')
      .then((response) => {
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data?.doctors || data?.data || [];
        if (active) setDoctors(list);
      })
      .catch(() => {
        if (active) setDoctors([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user?.name) {
      setValues((current) => ({
        ...current,
        patientName: user.name,
      }));
    }
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setMsg('');
    setBusy(true);

    try {
      const response = await api.post(
        '/appointments/send-otp',
        values
      );

      setDevOtp(response.data.developmentOtp || '');
      setStep(2);
      setMsg(
        response.data.message ||
          'Verification code generated.'
      );
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMsg('');

    try {
      const response = await api.post(
        '/appointments/verify-otp',
        { otp }
      );

      setAppointment(response.data.appointment);
      setMsg(
        response.data.message ||
          'Appointment request received.'
      );
      setStep(3);
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setBusy(false);
    }
  };

  const payNow = async () => {
    if (!appointment?._id) {
      setMsg('Appointment ID is missing. Please contact support.');
      return;
    }

    setBusy(true);
    setPaymentStatus('');
    setMsg('');

    try {
      const orderResponse = await api.post(
        '/payments/appointment/order',
        { appointmentId: appointment._id }
      );

      const order = orderResponse.data;

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src =
            'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () =>
            reject(
              new Error('Unable to load Razorpay Checkout.')
            );

          document.body.appendChild(script);
        });
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout is unavailable.');
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'CarePlus Hospital',
        description: 'Doctor appointment consultation',
        order_id: order.orderId,
        prefill: {
          name: values.patientName,
          contact: values.phone,
        },
        theme: {
          color: '#087f8c',
        },

        handler: async (response) => {
          setBusy(true);

          try {
            const verified = await api.post(
              '/payments/appointment/verify',
              response
            );

            setPaymentStatus(
              verified.data.message ||
                'Payment verified successfully.'
            );
          } catch (error) {
            setPaymentStatus(getError(error));
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentStatus(
              'Payment window closed. Your appointment remains pending until payment is verified.'
            );
          },
        },
      });

      checkout.open();
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setBusy(false);
    }
  };

  const paymentVerified =
    /verified|confirmed/i.test(paymentStatus);

  return (
    <main className="page narrow-page">
      <div className="page-title">
        <span className="eyebrow">YOUR HEALTH JOURNEY</span>
        <h1>
          Book an <em>appointment.</em>
        </h1>
        <p>
          Share your details to request an appointment with
          CarePlus.
        </p>
      </div>

      <div className="steps">
        <span className={step >= 1 ? 'current' : ''}>
          1 <small>Details</small>
        </span>
        <i />
        <span className={step >= 2 ? 'current' : ''}>
          2 <small>Verify</small>
        </span>
        <i />
        <span className={step >= 3 ? 'current' : ''}>
          3 <small>Complete</small>
        </span>
      </div>

      <div className="form-card appointment-card">
        {step === 1 && (
          <form className="stack-form" onSubmit={submit}>
            <h3>Appointment details</h3>

            <label>
              Patient name
              <input
                value={values.patientName}
                onChange={(event) =>
                  setValues({
                    ...values,
                    patientName: event.target.value,
                  })
                }
                placeholder="Full name"
                required
              />
            </label>

            <label>
              Mobile number
              <input
                value={values.phone}
                onChange={(event) =>
                  setValues({
                    ...values,
                    phone: event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10),
                  })
                }
                placeholder="10-digit mobile number"
                inputMode="numeric"
                pattern="[0-9]{10}"
                required
              />
            </label>

            <label>
              Preferred doctor (optional)
              <select
                value={values.doctor}
                onChange={(event) =>
                  setValues({
                    ...values,
                    doctor: event.target.value,
                  })
                }
              >
                <option value="">Any available doctor</option>

                {doctors.map((doctor) => (
                  <option
                    value={doctor._id}
                    key={doctor._id}
                  >
                    Dr. {doctor.name} — {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label>
                Appointment date
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={values.appointmentDate}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      appointmentDate: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Time slot
                <select
                  value={values.timeSlot}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      timeSlot: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Choose a slot</option>
                  <option>
                    Morning (09:00 AM - 12:00 PM)
                  </option>
                  <option>
                    Afternoon (12:00 PM - 04:00 PM)
                  </option>
                  <option>
                    Evening (04:00 PM - 08:00 PM)
                  </option>
                </select>
              </label>
            </div>

            <label>
              Reason for visit
              <textarea
                rows="3"
                value={values.reason}
                onChange={(event) =>
                  setValues({
                    ...values,
                    reason: event.target.value,
                  })
                }
                placeholder="Symptoms, consultation or routine checkup"
                required
              />
            </label>

            {msg && <Alert message={msg} />}

            <button
              className="btn btn-block"
              disabled={busy}
            >
              {busy
                ? 'Sending code…'
                : 'Continue to verification'}
              <ArrowRight size={16} />
            </button>

            <small className="helper-text">
              Development OTP appears on the screen and
              backend terminal. Configure real SMS delivery
              separately for production.
            </small>
          </form>
        )}

        {step === 2 && (
          <form className="stack-form" onSubmit={verify}>
            <span className="success-mark">
              <ShieldCheck />
            </span>

            <h3>Verify your mobile</h3>
            <p>
              Enter the 4-digit verification code generated
              by the server.
            </p>

            {devOtp && (
              <div className="dev-otp">
                Development OTP: <b>{devOtp}</b>
              </div>
            )}

            <label>
              Verification code
              <input
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 4)
                  )
                }
                placeholder="0000"
                inputMode="numeric"
                maxLength={4}
                required
              />
            </label>

            {msg && <Alert message={msg} />}

            <button
              className="btn btn-block"
              disabled={busy || otp.length !== 4}
            >
              {busy
                ? 'Verifying…'
                : 'Verify & book appointment'}
            </button>

            <button
              className="btn btn-light btn-block"
              type="button"
              disabled={busy}
              onClick={() => {
                setStep(1);
                setMsg('');
                setOtp('');
                setDevOtp('');
              }}
            >
              Back to details
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="success-state">
            <span className="success-mark">
              <CheckCircle2 />
            </span>

            <h2>Appointment request received!</h2>

            <p>
              {msg || 'Your appointment has been booked.'}
              {' '}Appointment ID: {appointment?._id || 'Saved'}.
            </p>

            {msg && <Alert message={msg} />}

            {paymentStatus && (
              <Alert
                message={paymentStatus}
                type={paymentVerified ? 'success' : 'error'}
              />
            )}

            <button
              type="button"
              className="btn btn-block"
              onClick={payNow}
              disabled={busy || paymentVerified}
            >
              {busy
                ? 'Processing payment…'
                : paymentVerified
                  ? 'Payment verified'
                  : 'Pay consultation fee with Razorpay'}
              <ArrowRight size={16} />
            </button>

            <p className="helper-text">
              Payment requires Razorpay test/live keys in
              backend/.env. Appointment confirmation must be
              determined by server-side payment verification.
            </p>

            <div className="hero-actions centered">
              <Link
                className="btn btn-light"
                to={user ? '/dashboard' : '/'}
              >
                Continue <ArrowRight size={16} />
              </Link>

              <Link className="btn btn-light" to="/">
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
