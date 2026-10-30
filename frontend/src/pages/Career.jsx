
import { useState } from 'react';
import {
  ArrowRight,
  HeartPulse,
  Users,
  TrendingUp,
  Stethoscope,
  BriefcaseMedical,
  Activity,
  X,
  Upload,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import api from '../api';

export default function Career() {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
  });

  const [resume, setResume] = useState(null);

  const roles = [
    {
      title: 'Doctors',
      icon: <Stethoscope />,
      desc: 'Deliver expert clinical care and make a meaningful difference.',
    },
    {
      title: 'Nursing',
      icon: <HeartPulse />,
      desc: 'Support patients with skill, empathy and compassion.',
    },
    {
      title: 'Paramedical',
      icon: <Activity />,
      desc: 'Contribute to diagnosis, treatment and patient recovery.',
    },
    {
      title: 'Support Staff',
      icon: <BriefcaseMedical />,
      desc: 'Help our hospital teams provide a seamless patient experience.',
    },
  ];

  const benefits = [
    {
      icon: <HeartPulse />,
      title: 'Meaningful work',
      desc: 'Make a positive difference in the lives of patients and families.',
    },
    {
      icon: <Users />,
      title: 'Team collaboration',
      desc: 'Work with people who value empathy, respect and teamwork.',
    },
    {
      icon: <TrendingUp />,
      title: 'Professional growth',
      desc: 'Build your skills and explore opportunities to grow your career.',
    },
  ];

  const steps = [
    ['01', 'Send your application', 'Tell our HR team about your role and experience.'],
    ['02', 'Application review', 'The hiring team reviews your profile and suitability.'],
    ['03', 'Interview', 'Shortlisted applicants may be contacted for an interview.'],
    ['04', 'Next steps', 'The HR team shares further details with selected applicants.'],
  ];

  const openForm = (position = '') => {
    setForm((previous) => ({ ...previous, position }));
    setMessage('');
    setShowForm(true);

    setTimeout(() => {
      document.getElementById('career-application-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    setMessage('');

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.position
    ) {
      setMessageType('error');
      setMessage('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMessageType('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    if (resume && resume.size > 5 * 1024 * 1024) {
      setMessageType('error');
      setMessage('Resume must be smaller than 5 MB.');
      return;
    }

    if (
      resume &&
      ![
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(resume.type)
    ) {
      setMessageType('error');
      setMessage('Please upload a PDF or Word resume.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (resume) payload.append('resume', resume);
      const response = await api.post('/career/apply', payload);

      setMessageType('success');
      setMessage(
        response.data?.message ||
        'Your career application has been submitted successfully.'
      );

      setForm({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        message: '',
      });

      setResume(null);
      const fileInput = document.getElementById('career-resume');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessageType('error');
      setMessage(
        error.response?.data?.message ||
        'Application submission failed. Check the backend route and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page career-page">
      {/* Hero */}
      <section className="career-hero">
        <span className="eyebrow">BUILD YOUR FUTURE WITH US</span>
        <h1>People caring for <em>people.</em></h1>

        <p>
          At CarePlus, we value talent, curiosity, teamwork and a commitment
          to helping people live healthier lives.
        </p>

        <button
          type="button"
          className="btn"
          onClick={() => openForm()}
        >
          Apply for a position <ArrowRight size={16} />
        </button>
      </section>

      {/* Opportunities */}
      <section className="section section-inset career-opportunities">
        <div className="section-head">
          <div>
            <span className="eyebrow">OPPORTUNITIES</span>
            <h2>Find your place at CarePlus.</h2>
            <p>Explore the teams where you could make a difference.</p>
          </div>
        </div>

        <div className="specialty-grid career-role-grid">
          {roles.map((role) => (
            <article className="specialty-card career-card" key={role.title}>
              <span className="career-icon">{role.icon}</span>
              <b>{role.title}</b>
              <small>{role.desc}</small>

              <button
                type="button"
                className="text-link"
                onClick={() => openForm(role.title)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Enquire <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>

        <p className="center muted career-note">
          Interested in joining us? Submit your application to our HR team.
        </p>
      </section>

      {/* Benefits */}
      <section className="career-benefits">
        <div className="career-section-heading">
          <span className="eyebrow">LIFE AT CAREPLUS</span>
          <h2>More than a job. A chance to make a difference.</h2>
          <p>
            Bring your skills, learn from others and help us create a better
            healthcare experience.
          </p>
        </div>

        <div className="career-benefit-grid">
          {benefits.map((benefit) => (
            <article className="career-benefit-card" key={benefit.title}>
              <span className="career-icon">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Hiring process */}
      <section className="career-process">
        <div className="career-section-heading">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Your journey starts here.</h2>
          <p>A simple overview of the application process.</p>
        </div>

        <div className="career-steps">
          {steps.map(([number, title, description]) => (
            <article className="career-step" key={number}>
              <span className="career-step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HR contact */}
      <section className="career-contact" id="career-contact">
        <div>
          <span className="eyebrow">LET'S CONNECT</span>
          <h2>Ready to take the next step?</h2>
          <p>
            Apply online and share your details with our career team.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => openForm()}
        >
          Email our HR team <ArrowRight size={16} />
        </button>
      </section>

      {/* Application form */}
      {showForm && (
        <section
          className="section"
          id="career-application-form"
          style={{ scrollMarginTop: 100 }}
        >
          <div className="form-card" style={{ maxWidth: 720, margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div>
                <span className="eyebrow">CAREER APPLICATION</span>
                <h2>Apply to CarePlus</h2>
                <p>Fill in your details and our team can review your application.</p>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close application form"
              >
                <X />
              </button>
            </div>

            <form onSubmit={submitApplication}>
              <label htmlFor="career-name">Full name *</label>
              <input
                id="career-name"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter your full name"
                required
              />

              <label htmlFor="career-email">Email address *</label>
              <input
                id="career-email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                required
              />

              <label htmlFor="career-phone">Phone number *</label>
              <input
                id="career-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="Enter phone number"
                required
              />

              <label htmlFor="career-position">Position *</label>
              <select
                id="career-position"
                name="position"
                value={form.position}
                onChange={updateField}
                required
              >
                <option value="">Select a position</option>
                {roles.map((role) => (
                  <option key={role.title} value={role.title}>
                    {role.title}
                  </option>
                ))}
              </select>

              <label htmlFor="career-experience">Experience</label>
              <select
                id="career-experience"
                name="experience"
                value={form.experience}
                onChange={updateField}
              >
                <option value="">Select experience</option>
                <option value="Fresher">Fresher</option>
                <option value="1-2 years">1–2 years</option>
                <option value="3-5 years">3–5 years</option>
                <option value="5+ years">5+ years</option>
              </select>

              <label htmlFor="career-message">Message</label>
              <textarea
                id="career-message"
                name="message"
                value={form.message}
                onChange={updateField}
                placeholder="Tell us briefly about yourself"
                rows={4}
              />

              <label htmlFor="career-resume">
                Resume (PDF/DOC/DOCX, max 5 MB)
              </label>
              <input
                id="career-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setResume(event.target.files?.[0] || null)
                }
              />

              {resume && (
                <p className="muted">
                  <Upload size={15} /> Selected: {resume.name}
                </p>
              )}

              {message && (
                <div
                  role="status"
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 12,
                    background: messageType === 'success' ? '#e8f7ee' : '#fff0f0',
                    color: messageType === 'success' ? '#176b39' : '#a52222',
                  }}
                >
                  {messageType === 'success' && <CheckCircle2 size={16} />}
                  {' '}{message}
                </div>
              )}

              <button
                className="btn btn-block"
                type="submit"
                disabled={submitting}
                style={{ marginTop: 16 }}
              >
                {submitting ? 'Submitting...' : 'Submit application'}
                <ArrowRight size={16} />
              </button>

              <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Your application and selected resume will be sent securely to the CarePlus hiring team.</p>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
