
import {
  React,
  useState,
  Link,
  Formik,
  Form,
  Field,
  Yup,
  api,
  getError,
  specialties,
  Alert,
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Hospital,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  TrendingUp,
  Star,
  ChevronRight,
  Mail,
  Sparkles,
} from '../lib/pageImports';

export default function Home() {
  const [msg, setMsg] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [hospitalLocations, setHospitalLocations] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Fetch verified doctors from backend
  React.useEffect(() => {
    let active = true;

    async function fetchDoctors() {
      try {
        const response = await api.get('/doctors');
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data?.doctors || data?.data || [];

        if (active) setDoctors(list.slice(0, 3));
      } catch (error) {
        console.error('Unable to load doctors:', error);
        if (active) setDoctors([]);
      } finally {
        if (active) setLoadingDoctors(false);
      }
    }

    fetchDoctors();

    return () => {
      active = false;
    };
  }, []);

  // Fetch hospital locations from MongoDB through the API.
  React.useEffect(() => {
    let active = true;
    api.get('/hospitals')
      .then((response) => {
        const result = response.data;
        const list = Array.isArray(result) ? result : result?.hospitals || [];
        if (active) setHospitalLocations(list.filter((hospital) => hospital.isActive !== false));
      })
      .catch((error) => { console.error('Unable to load hospitals:', error); if (active) setHospitalLocations([]); })
      .finally(() => { if (active) setLoadingHospitals(false); });
    return () => { active = false; };
  }, []);

  // Fetch health packages from backend
  React.useEffect(() => {
    let active = true;

    async function fetchPackages() {
      try {
        const response = await api.get('/packages');
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data?.packages || data?.data || [];

        if (active) setPackages(list.slice(0, 3));
      } catch (error) {
        console.error('Unable to load packages:', error);
        if (active) setPackages([]);
      } finally {
        if (active) setLoadingPackages(false);
      }
    }

    fetchPackages();

    return () => {
      active = false;
    };
  }, []);

  const packageName = (item) =>
    item.name || item.title || item.packageName || 'Health Package';

  const packagePrice = (item) =>
    item.price ?? item.amount ?? item.fee;

  const packageDescription = (item) =>
    item.description || item.details || 'Explore the package details.';

  const doctorName = (doctor) =>
    doctor.name || doctor.fullName || 'CarePlus Doctor';

  const doctorSpecialty = (doctor) =>
    doctor.specialty || doctor.specialization || 'Medical Specialist';

  const doctorExperience = (doctor) =>
    doctor.experience ?? doctor.experienceYears;

  const doctorImage = (doctor) =>
    doctor.image || doctor.profileImage || doctor.photo || '';

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            YOUR HEALTH, OUR PRIORITY
          </span>

          <h1>
            Your path to better health <em>starts here.</em>
          </h1>

          <p>
            Expert doctors, advanced care and a team that puts you first.
            Discover trusted healthcare for every stage of life.
          </p>

          <div className="hero-actions">
            <Link className="btn" to="/appointments">
              Book an appointment <ArrowRight size={17} />
            </Link>

            <Link className="btn btn-light" to="/doctors">
              Explore doctors
            </Link>
          </div>

          <div className="trust-points">
            <span>
              <CheckCircle2 /> Experienced specialists
            </span>
            <span>
              <CheckCircle2 /> Patient-first care
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orb" />

          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
            alt="Doctor at CarePlus"
          />

          <div className="float-card float-top">
            <span className="float-icon">
              <ShieldCheck />
            </span>
            <div>
              <b>Care you can trust</b>
              <small>Compassionate, expert team</small>
            </div>
          </div>

          <div className="float-card float-bottom">
            <span className="star-icon">
              <Star fill="currentColor" />
            </span>
            <div>
              <b>Patient-first approach</b>
              <small>Here for your wellbeing</small>
            </div>
          </div>
        </div>
      </section>

      {/* HOSPITAL STATISTICS */}
      <section className="stats">
        <div>
          <span><Hospital /></span>
          <b>{hospitalLocations.length} <small>Hospital locations</small></b>
        </div>
        <div>
          <span><Stethoscope /></span>
          <b>30+ <small>Medical specialties</small></b>
        </div>
        <div>
          <span><Users /></span>
          <b>Expert <small>Care teams</small></b>
        </div>
        <div>
          <span><Clock3 /></span>
          <b>24/7 <small>Emergency support</small></b>
        </div>
      </section>

      {/* QUICK BOOKING */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">START YOUR CARE JOURNEY</span>
            <h2>Healthcare made <em>simple.</em></h2>
            <p>Find a doctor and take the next step towards better health.</p>
          </div>
        </div>

        <div className="specialty-grid">
          <Link to="/doctors" className="specialty-card">
            <span><Search /></span>
            <b>Find a Doctor</b>
            <small>Explore specialists and their expertise</small>
            <ArrowRight className="specialty-arrow" size={17} />
          </Link>

          <Link to="/appointments" className="specialty-card">
            <span><CalendarDays /></span>
            <b>Book Appointment</b>
            <small>Request a visit with a specialist</small>
            <ArrowRight className="specialty-arrow" size={17} />
          </Link>

          <Link to="/packages" className="specialty-card">
            <span><HeartPulse /></span>
            <b>Health Packages</b>
            <small>Explore available health checkups</small>
            <ArrowRight className="specialty-arrow" size={17} />
          </Link>

          <Link to="/wellness" className="specialty-card">
            <span><MapPin /></span>
            <b>Our Hospitals</b>
            <small>Find a convenient care location</small>
            <ArrowRight className="specialty-arrow" size={17} />
          </Link>
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">MEET OUR MEDICAL TEAM</span>
            <h2>Find the right <em>doctor.</em></h2>
            <p>Explore specialists available through CarePlus.</p>
          </div>

          <Link className="text-link" to="/doctors">
            All doctors <ArrowRight size={16} />
          </Link>
        </div>

        {loadingDoctors ? (
          <p className="muted">Loading doctors...</p>
        ) : doctors.length > 0 ? (
          <div className="specialty-grid">
            {doctors.map((doctor) => (
              <article
                className="specialty-card"
                key={doctor._id || doctor.id || doctor.email || doctorName(doctor)}
              >
                {doctorImage(doctor) ? (
                  <img
                    src={doctorImage(doctor)}
                    alt={doctorName(doctor)}
                    style={{
                      width: 76,
                      height: 76,
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <span><Stethoscope /></span>
                )}

                <b>Dr. {doctorName(doctor)}</b>
                <small>{doctorSpecialty(doctor)}</small>

                {doctorExperience(doctor) != null && (
                  <small>
                    {doctorExperience(doctor)} years experience
                  </small>
                )}

                <Link
                  className="text-link"
                  to="/appointments"
                  style={{ marginTop: 12 }}
                >
                  Book appointment <ChevronRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="form-card">
            <h3>Meet our specialists</h3>
            <p>
              Browse the available doctors and their profiles.
            </p>
            <Link className="btn" to="/doctors">
              Explore doctors <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* MEDICAL SPECIALTIES */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">CARE FOR EVERY NEED</span>
            <h2>Healthcare made <em>personal.</em></h2>
            <p>Find the right care, at the right time, close to home.</p>
          </div>

          <Link className="text-link" to="/doctors">
            Meet our doctors <ArrowRight size={16} />
          </Link>
        </div>

        <div className="specialty-grid">
          {[
            {
              icon: <HeartPulse />,
              title: 'Heart & Cardiology',
              text: 'Expert heart care and diagnostics',
            },
            {
              icon: <Activity />,
              title: 'Cancer Care',
              text: 'Comprehensive oncology services',
            },
            {
              icon: <Stethoscope />,
              title: 'General Medicine',
              text: 'Everyday health and prevention',
            },
            {
              icon: <Sparkles />,
              title: 'Diagnostics',
              text: 'Advanced tests and health checks',
            },
          ].map((specialty, index) => (
            <Link
              to={index === 3 ? '/packages' : '/doctors'}
              className="specialty-card"
              key={specialty.title}
            >
              <span>{specialty.icon}</span>
              <b>{specialty.title}</b>
              <small>{specialty.text}</small>
              <ArrowRight className="specialty-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>

      {/* HEALTH PACKAGES */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">PREVENTIVE HEALTHCARE</span>
            <h2>Popular health <em>packages.</em></h2>
            <p>Explore health checkup packages available at CarePlus.</p>
          </div>

          <Link className="text-link" to="/packages">
            All packages <ArrowRight size={16} />
          </Link>
        </div>

        {loadingPackages ? (
          <p className="muted">Loading health packages...</p>
        ) : packages.length > 0 ? (
          <div className="specialty-grid">
            {packages.map((item) => (
              <article
                className="specialty-card"
                key={item._id || item.id || packageName(item)}
              >
                <span><HeartPulse /></span>
                <b>{packageName(item)}</b>
                <small>{packageDescription(item)}</small>

                {packagePrice(item) != null && (
                  <h3>
                    ₹{Number(packagePrice(item)).toLocaleString('en-IN')}
                  </h3>
                )}

                <Link
                  className="text-link"
                  to="/packages"
                  style={{ marginTop: 12 }}
                >
                  View package <ChevronRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="form-card">
            <h3>Explore our health packages</h3>
            <p>
              Visit the packages page to see available health checkups.
            </p>
            <Link className="btn" to="/packages">
              Explore packages <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-band">
        <div>
          <span className="eyebrow">HERE WHEN YOU NEED US</span>
          <h2>Take the next step toward better health.</h2>
          <p>Book a visit with a trusted CarePlus specialist today.</p>
        </div>

        <Link to="/appointments" className="btn btn-white">
          Book a visit <ArrowRight size={17} />
        </Link>
      </section>

      {/* CALLBACK ENQUIRY */}
      <section className="section enquiry-section">
        <div className="enquiry-copy">
          <span className="eyebrow">WE'RE HERE TO HELP</span>
          <h2>How can we <em>help you?</em></h2>
          <p>
            Tell us where you want care and our team will help you
            find the right service.
          </p>

          <div className="contact-line">
            <Phone />
            <div>
              <b>Need assistance?</b>
              <small>Call 7503141435</small>
            </div>
          </div>
        </div>

        <Formik
          initialValues={{
            name: '',
            email: '',
            location: '',
            department: '',
          }}
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string()
              .email('Enter a valid email')
              .required('Email is required'),
            location: Yup.string().required('Select a location'),
            department: Yup.string().required('Select a department'),
          })}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setMsg('');

            try {
              const response = await api.post('/enquiries', values);
              setMsg(response.data.message || 'Enquiry received successfully.');
              resetForm();
            } catch (error) {
              setMsg(getError(error));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-card">
              <h3>Request a callback</h3>
              <p>Share your details and we'll get in touch.</p>

              <Field name="name" placeholder="Your full name" />
              <Field
                name="email"
                type="email"
                placeholder="Email address"
              />

              <Field name="location" as="select">
                <option value="">{loadingHospitals ? 'Loading hospitals…' : 'Select hospital location'}</option>
                {hospitalLocations.map((hospital) => (
                  <option key={hospital._id} value={hospital.location || hospital.name}>
                    {hospital.name}
                  </option>
                ))}
              </Field>

              <Field name="department" as="select">
                <option value="">Select speciality</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </Field>

              {msg && (
                <Alert
                  message={msg}
                  type={
                    msg.toLowerCase().includes('received') ||
                    msg.toLowerCase().includes('success')
                      ? 'success'
                      : 'error'
                  }
                />
              )}

              <button className="btn btn-block" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Submit enquiry'}
                <ArrowRight size={16} />
              </button>
            </Form>
          )}
        </Formik>
      </section>
    </>
  );
}
