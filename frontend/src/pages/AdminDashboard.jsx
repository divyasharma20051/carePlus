import { useCallback, useEffect, useState } from 'react';
import { api, getError } from '../api';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, ClipboardList, Search, Stethoscope, Users, Hospital, BriefcaseMedical, CreditCard, Download, RefreshCw } from 'lucide-react';
import { Alert } from '../components/shared';

const hospitalBlank = { name: '', location: '', address: '', image: '', rating: 4.5, phone: '' };
const statusOptions = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [hospitalForm, setHospitalForm] = useState(hospitalBlank);
  const [editingHospitalId, setEditingHospitalId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.get('/admin/dashboard'); setData(r.data); }
    catch (e) { setMsg(getError(e)); }
  }, []);
  const loadHospitals = useCallback(async () => {
    try { const r = await api.get('/hospitals'); setHospitals(r.data?.hospitals || []); }
    catch (e) { setMsg(getError(e)); }
  }, []);
  useEffect(() => { load(); loadHospitals(); }, [load, loadHospitals]);

  const action = async (url, method = 'patch', body = {}) => {
    try { await api({ url, method, data: body }); setMsg('Updated successfully.'); await load(); await loadHospitals(); }
    catch (e) { setMsg(getError(e)); }
  };
  const saveHospital = async (event) => {
    event.preventDefault(); setBusy(true); setMsg('');
    try {
      if (editingHospitalId) await api.patch(`/admin/hospitals/${editingHospitalId}`, hospitalForm);
      else await api.post('/admin/hospitals', hospitalForm);
      setMsg(editingHospitalId ? 'Hospital updated successfully.' : 'Hospital added successfully.');
      setHospitalForm(hospitalBlank); setEditingHospitalId(''); await loadHospitals();
    } catch (e) { setMsg(getError(e)); } finally { setBusy(false); }
  };
  const editHospital = (h) => { setEditingHospitalId(h._id); setHospitalForm({ name: h.name || '', location: h.location || '', address: h.address || '', image: h.image || '', rating: h.rating ?? 4.5, phone: h.phone || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const deleteHospital = async (h) => { if (window.confirm(`Delete ${h.name}?`)) await action(`/admin/hospitals/${h._id}`, 'delete'); };
  const updateCareerStatus = async (id, status) => {
    try { await api.patch(`/admin/career-applications/${id}`, { status }); setMsg('Career application status updated.'); await load(); }
    catch (e) { setMsg(getError(e)); }
  };

  const baseTabs = [['pending', 'Pending doctors'], ['doctors', 'Doctors'], ['patients', 'Patients'], ['appointments', 'Appointments'], ['enquiries', 'Enquiries'], ['careers', 'Career applications'], ['payments', 'Payments'], ['hospitals', 'Hospitals']];
  const rows = tab === 'pending' ? data?.pendingDoctors : tab === 'doctors' ? data?.doctors : tab === 'patients' ? data?.patients : tab === 'appointments' ? data?.appointments : tab === 'enquiries' ? data?.enquiries : tab === 'careers' ? data?.careerApplications : tab === 'payments' ? data?.payments : [];
  const filtered = (rows || []).filter((x) => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  const titles = { pending: 'Doctor approval requests', doctors: 'Approved doctors', patients: 'Registered patients', appointments: 'All appointments', enquiries: 'Home page enquiries', careers: 'Career applications', payments: 'Payment records', hospitals: 'Hospital locations' };

  return <main className="page dashboard-page">
    <div className="dashboard-title"><div><span className="eyebrow">ADMINISTRATION</span><h1>Hospital <em>overview.</em></h1><p>Manage doctors, applications, locations and payment activity.</p></div><button className="btn btn-light" onClick={() => { load(); loadHospitals(); }}><RefreshCw size={16}/> Refresh data</button></div>
    {msg && <Alert message={msg} type={msg.toLowerCase().includes('success') || msg.toLowerCase().includes('updated') ? 'success' : 'error'} onClose={() => setMsg('')} />}
    <div className="dashboard-metrics admin-metrics">{[['Pending doctors', data?.stats.pendingDoctors || 0, <Clock3/>], ['Approved doctors', data?.stats.doctors || 0, <Stethoscope/>], ['Patients', data?.stats.patients || 0, <Users/>], ['Appointments', data?.stats.appointments || 0, <CalendarDays/>], ['Career applications', data?.stats.careerApplications || 0, <BriefcaseMedical/>], ['Payments', data?.stats.payments || 0, <CreditCard/>]].map(([label, count, icon]) => <div key={label}>{icon}<span><b>{count}</b><small>{label}</small></span></div>)}</div>

    <div className="table-card" style={{ marginBottom: 20 }}><div className="admin-tabs">{baseTabs.map(([value, label]) => <button className={tab === value ? 'active' : ''} key={value} onClick={() => { setTab(value); setSearch(''); }}>{label}</button>)}</div></div>
    {tab === 'hospitals' && <section className="table-card" style={{ marginBottom: 24 }}><div className="table-heading"><div><h2>{editingHospitalId ? 'Edit hospital' : 'Add hospital'}</h2><p>These records power the public hospital page and enquiry dropdown.</p></div></div>
      <form className="form-card" onSubmit={saveHospital} style={{ margin: 20 }}>
        <label>Hospital name<input required value={hospitalForm.name} onChange={e => setHospitalForm({ ...hospitalForm, name: e.target.value })}/></label>
        <label>City / location<input required value={hospitalForm.location} onChange={e => setHospitalForm({ ...hospitalForm, location: e.target.value })}/></label>
        <label>Address<input value={hospitalForm.address} onChange={e => setHospitalForm({ ...hospitalForm, address: e.target.value })}/></label>
        <label>Image URL<input value={hospitalForm.image} onChange={e => setHospitalForm({ ...hospitalForm, image: e.target.value })}/></label>
        <label>Rating (0–5)<input type="number" min="0" max="5" step="0.1" value={hospitalForm.rating} onChange={e => setHospitalForm({ ...hospitalForm, rating: e.target.value === '' ? '' : Number(e.target.value) })}/></label>
        <label>Phone<input value={hospitalForm.phone} onChange={e => setHospitalForm({ ...hospitalForm, phone: e.target.value })}/></label>
        <div className="hero-actions"><button className="btn" disabled={busy}>{busy ? 'Saving…' : editingHospitalId ? 'Save changes' : 'Add hospital'} <ArrowRight size={16}/></button>{editingHospitalId && <button className="btn btn-light" type="button" onClick={() => { setEditingHospitalId(''); setHospitalForm(hospitalBlank); }}>Cancel</button>}</div>
      </form>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Hospital</th><th>Location</th><th>Rating</th><th>Actions</th></tr></thead><tbody>{hospitals.map(h => <tr key={h._id}><td>{h.name}<small>{h.address}</small></td><td>{h.location}</td><td>{h.rating ?? '—'}</td><td className="table-actions"><button className="approve-btn" onClick={() => editHospital(h)}>Edit</button><button className="delete-btn" onClick={() => deleteHospital(h)}>Delete</button></td></tr>)}{!hospitals.length && <tr><td colSpan="4">No hospitals found. Add one above.</td></tr>}</tbody></table></div>
    </section>}

    {tab !== 'hospitals' && <section className="table-card"><div className="table-heading"><div><h2>{titles[tab]}</h2><p>Search and manage CarePlus records</p></div><div className="admin-search"><Search/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records"/></div></div>
      {!data ? <p className="center muted">Loading admin data…</p> : filtered.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{tab === 'appointments' ? <><th>Patient</th><th>Date / slot</th><th>Reason</th><th>Status</th><th>Action</th></> : tab === 'enquiries' ? <><th>Name</th><th>Email</th><th>Location</th><th>Department</th></> : tab === 'careers' ? <><th>Applicant</th><th>Position</th><th>Resume</th><th>Status</th></> : tab === 'payments' ? <><th>Order ID</th><th>Appointment</th><th>Amount</th><th>Status</th></> : <><th>Name</th><th>Email</th><th>{tab === 'pending' || tab === 'doctors' ? 'Specialty' : 'Created'}</th><th>Action</th></>}</tr></thead><tbody>{filtered.map(x => <tr key={x._id}>
        {tab === 'appointments' ? <><td>{x.patientName}</td><td>{new Date(x.appointmentDate).toLocaleDateString()}<small>{x.timeSlot}</small></td><td>{x.reason}</td><td>{x.status}</td><td><select value={x.status} onChange={e => action(`/admin/appointments/${x._id}`, 'patch', { status: e.target.value })}><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>Completed</option></select></td></>
        : tab === 'enquiries' ? <><td>{x.name}</td><td>{x.email}</td><td>{x.location}</td><td>{x.department}</td></>
        : tab === 'careers' ? <><td>{x.name}<small>{x.email} · {x.phone}</small><small>{x.experience || 'Experience not specified'}</small><small>{x.message}</small></td><td>{x.position}</td><td>{x.resume?.filename ? <a className="text-link" href={`${api.defaults.baseURL}/admin/career-applications/${x._id}/resume`} onClick={async e => { e.preventDefault(); try { const r = await api.get(`/admin/career-applications/${x._id}/resume`, { responseType: 'blob' }); const url = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href = url; a.download = x.resume.originalName || 'resume'; a.click(); URL.revokeObjectURL(url); } catch (err) { setMsg(getError(err)); } }}><Download size={15}/> {x.resume.originalName || 'Download'}</a> : 'No resume'}</td><td><select value={x.status} onChange={e => updateCareerStatus(x._id, e.target.value)}>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></td></>
        : tab === 'payments' ? <><td>{x.razorpayOrderId}</td><td>{x.appointment?.patientName || x.appointment?._id || 'Appointment'}</td><td>₹{Number(x.amount).toLocaleString('en-IN')}</td><td>{x.status}</td></>
        : <><td>{x.name}</td><td>{x.email}</td><td>{tab === 'pending' || tab === 'doctors' ? (x.specialty || 'General') : new Date(x.createdAt).toLocaleDateString()}</td><td className="table-actions">{tab === 'pending' ? <><button className="approve-btn" onClick={() => action(`/admin/doctors/${x._id}/approve`)}>Approve</button><button className="delete-btn" onClick={() => window.confirm(`Reject ${x.name}?`) && action(`/admin/users/${x._id}`, 'delete')}>Reject</button></> : tab === 'patients' || tab === 'doctors' ? <button className="delete-btn" onClick={() => window.confirm(`Delete ${x.name}?`) && action(`/admin/users/${x._id}`, 'delete')}>Remove</button> : '—'}</td></>}
      </tr>)}</tbody></table></div> : <div className="empty-state"><ClipboardList/><h3>No records to display</h3><p>There are no matching records for this section.</p></div>}
    </section>}
  </main>;
}
