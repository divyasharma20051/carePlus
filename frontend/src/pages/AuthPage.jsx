import {
  React,
  useState,
  Link,
  useNavigate,
  useLocation,
  Formik,
  Form,
  Field,
  Yup,
  api,
  getError,
  specialties,
  Alert,
  ArrowRight,
  ShieldCheck
} from '../lib/pageImports';

export default function AuthPage({ mode, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [registerValues, setRegisterValues] = useState(null);
  const [otp, setOtp] = useState('');
  const [loadingOTP, setLoadingOTP] = useState(false);

  const isRegister = mode === 'register';

  const showMessage = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleRegister = async (values) => {
    setMessage('');

    try {
      const response = await api.post('/auth/register', values);

      if (response.data.otpRequired) {
        setRegisterValues(values);
        setPendingEmail(response.data.email || values.email);
        setOtpStep(true);
        showMessage(
          response.data.message || 'OTP sent to your email.',
          'success'
        );
      } else {
        showMessage(
          'Unexpected server response. Please check the backend OTP setup.'
        );
      }
    } catch (error) {
      showMessage(getError(error));
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!/^\d{6}$/.test(otp)) {
      showMessage('Please enter the 6-digit OTP.');
      return;
    }

    setLoadingOTP(true);

    try {
      const response = await api.post('/auth/verify-registration-otp', {
        email: pendingEmail,
        otp
      });

      showMessage(
        response.data.message || 'Email verified and account created.',
        'success'
      );

      setOtpStep(false);
      setOtp('');
      setRegisterValues(null);

      navigate('/login', { replace: true });
    } catch (error) {
      showMessage(getError(error));
    } finally {
      setLoadingOTP(false);
    }
  };

  const handleLogin = async (values) => {
    try {
      const response = await api.post('/auth/login', values);
      onLogin(response.data.user);

      const intended = location.state?.from;
      const fallback =
        response.data.user.role === 'admin'
          ? '/admin'
          : response.data.user.role === 'doctor'
            ? '/doctor'
            : '/dashboard';

      navigate(intended?.pathname || fallback, { replace: true });
    } catch (error) {
      showMessage(getError(error));
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-art-inner">
          <span className="eyebrow">CARE THAT MOVES YOU FORWARD</span>
          <h1>
            Better care.
            <br />
            <em>Better living.</em>
          </h1>
          <p>
            CarePlus connects you with experienced medical professionals and
            trusted healthcare services.
          </p>
          <div className="auth-benefit">
            <ShieldCheck />
            <span>
              <b>Your care comes first</b>
              <small>Secure account and trusted specialists</small>
            </span>
          </div>
        </div>
      </div>

      <div className="auth-form-area">
        <div className="auth-card">
          <Link className="back-link" to="/">
            ← Back to home
          </Link>

          <span className="eyebrow">
            {otpStep
              ? 'EMAIL VERIFICATION'
              : isRegister
                ? 'JOIN CAREPLUS'
                : 'WELCOME BACK'}
          </span>

          <h2>
            {otpStep
              ? 'Verify your email'
              : isRegister
                ? 'Create your account'
                : 'Sign in to CarePlus'}
          </h2>

          <p>
            {otpStep
              ? `Enter the 6-digit code sent to ${pendingEmail}.`
              : isRegister
                ? 'Register to manage your healthcare journey.'
                : 'Access your appointments and healthcare dashboard.'}
          </p>

          {message && (
            <Alert message={message} type={messageType} />
          )}

          {otpStep ? (
            <form className="stack-form" onSubmit={handleVerifyOTP}>
              <label>
                Email address
                <input
                  type="email"
                  value={pendingEmail}
                  readOnly
                  autoComplete="email"
                />
              </label>

              <label>
                6-digit OTP
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  required
                />
              </label>

              <button
                className="btn btn-block"
                type="submit"
                disabled={loadingOTP}
              >
                {loadingOTP ? 'Verifying...' : 'Verify OTP'}
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-block"
                type="button"
                disabled={loadingOTP}
                onClick={() => {
                  setOtpStep(false);
                  setOtp('');
                  showMessage(
                    'You can return to the signup form and submit your details again.'
                  );
                }}
              >
                Back to registration
              </button>
            </form>
          ) : (
            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                role: 'patient',
                specialty: 'General Physician',
                experience: ''
              }}
              validationSchema={Yup.object({
                name: isRegister
                  ? Yup.string().trim().required('Name is required')
                  : Yup.string(),
                email: Yup.string()
                  .email('Enter a valid email')
                  .required('Email is required'),
                password: Yup.string()
                  .min(6, 'At least 6 characters')
                  .required('Password is required'),
                role: Yup.string(),
                specialty: Yup.string(),
                experience: Yup.number()
                  .min(0, 'Experience cannot be negative')
                  .nullable()
              })}
              onSubmit={async (values, { setSubmitting }) => {
                setMessage('');

                try {
                  if (isRegister) {
                    await handleRegister({
                      ...values,
                      email: values.email.trim().toLowerCase(),
                      experience:
                        values.experience === ''
                          ? 0
                          : Number(values.experience)
                    });
                  } else {
                    await handleLogin(values);
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="stack-form">
                  {isRegister && (
                    <>
                      <label>
                        Full name
                        <Field name="name" placeholder="Your full name" />
                      </label>

                      <label>
                        Register as
                        <Field name="role" as="select">
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                        </Field>
                      </label>

                      <Field name="role">
                        {({ field }) =>
                          field.value === 'doctor' ? (
                            <div className="form-row">
                              <label>
                                Specialty
                                <Field name="specialty" as="select">
                                  {specialties.map((specialty) => (
                                    <option key={specialty} value={specialty}>
                                      {specialty}
                                    </option>
                                  ))}
                                </Field>
                              </label>

                              <label>
                                Experience (years)
                                <Field
                                  name="experience"
                                  type="number"
                                  min="0"
                                  placeholder="e.g. 5"
                                />
                              </label>
                            </div>
                          ) : null
                        }
                      </Field>
                    </>
                  )}

                  <label>
                    Email address
                    <Field
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    Password
                    <Field
                      name="password"
                      type="password"
                      placeholder="At least 6 characters"
                    />
                  </label>

                  <button
                    className="btn btn-block"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Please wait...'
                      : isRegister
                        ? 'Send verification OTP'
                        : 'Log in'}
                    <ArrowRight size={16} />
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {!otpStep && (
            <div className="auth-switch">
              {isRegister
                ? 'Already have an account?'
                : 'New to CarePlus?'}{' '}
              <Link to={isRegister ? '/login' : '/register'}>
                {isRegister ? 'Log in' : 'Create an account'}
              </Link>
            </div>
          )}

          <small className="auth-note">
            Doctor accounts need approval from a CarePlus administrator before
            sign-in.
          </small>
        </div>
      </div>
    </main>
  );
}