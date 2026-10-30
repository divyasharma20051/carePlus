import { React, useNavigate, Routes, Route, Link, Navigate, ArrowRight, HeartPulse, CheckCircle2, ShieldCheck } from '../lib/pageImports';
import { useAuth, ProtectedRoute, Shell, NavigateHome, AccessRedirect } from '../components/shared';
import Home from '../pages/Home';
import AuthPage from '../pages/AuthPage';
import Doctors from '../pages/Doctors';
import AppointmentPage from '../pages/AppointmentPage';
import Wellness from '../pages/Wellness';
import Packages from '../pages/Packages';
import Career from '../pages/Career';
import Dashboard from '../pages/Dashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';
import api from '../api';

export default function AppRoutes(){const {user,setUser,loading,refresh}=useAuth();const navigate=useNavigate();const logout=async()=>{try{await api.post('/auth/logout')}catch{}setUser(null);navigate('/')};if(loading)return <div className="loading-screen"><span className="brand-icon"><HeartPulse/></span><p>Preparing your CarePlus experience…</p></div>;return <Shell user={user} onLogout={logout}><Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={user ? <NavigateHome user={user}/> : <AuthPage mode="login" onLogin={setUser}/>} />
<Route path="/register" element={user ? <NavigateHome user={user}/> : <AuthPage mode="register" onLogin={setUser}/>} />
<Route path="/doctors" element={<ProtectedRoute user={user}><Doctors /></ProtectedRoute>} />
<Route path="/appointments" element={<ProtectedRoute user={user}><AppointmentPage user={user}/></ProtectedRoute>} />
<Route path="/wellness" element={<ProtectedRoute user={user}><Wellness /></ProtectedRoute>} />
<Route path="/packages" element={<ProtectedRoute user={user}><Packages /></ProtectedRoute>} />
<Route path="/career" element={<ProtectedRoute user={user}><Career /></ProtectedRoute>} />
<Route path="/dashboard" element={<ProtectedRoute user={user} roles={["patient"]}><Dashboard user={user}/></ProtectedRoute>} />
<Route path="/doctor" element={<ProtectedRoute user={user} roles={["doctor"]}><DoctorDashboard user={user}/></ProtectedRoute>} />
<Route path="/admin" element={<ProtectedRoute user={user} roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
<Route path="*" element={<NotFound />} />
</Routes></Shell>}
