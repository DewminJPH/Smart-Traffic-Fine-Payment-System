import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, DollarSign, FileText, PlusCircle, 
  Trash2, Edit, Award, LogOut, CheckCircle, AlertCircle, 
  MapPin, Sliders, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';

const API_BASE = 'http://localhost:8090/api/v1';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // API State
  const [isStandalone, setIsStandalone] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 28000,
    totalFinesPaid: 11,
    districtSummaries: [
      { district: 'Colombo', totalAmount: 15000, totalFinesPaid: 6 },
      { district: 'Kandy', totalAmount: 8000, totalFinesPaid: 3 },
      { district: 'Galle', totalAmount: 5000, totalFinesPaid: 2 }
    ],
    categorySummaries: [
      { categoryId: 'V001', categoryName: 'Speeding Above Limit', totalAmount: 9000, totalFinesPaid: 3 },
      { categoryId: 'V003', categoryName: 'Drunk Driving', totalAmount: 10000, totalFinesPaid: 1 },
      { categoryId: 'V005', categoryName: 'No Helmet / Seatbelt', totalAmount: 4000, totalFinesPaid: 2 },
      { categoryId: 'V006', categoryName: 'Traffic Light Violation', totalAmount: 5000, totalFinesPaid: 5 }
    ],
    officerPerformances: [
      { officerId: 'PC1001', finesIssued: 8, amountIssued: 16000 },
      { officerId: 'PC1002', finesIssued: 5, amountIssued: 12000 }
    ]
  });

  const [officers, setOfficers] = useState([
    { officerId: 'PC1001', firstName: 'Sunil', lastName: 'Fernando', badgeNumber: 'B8821', phoneNumber: '0771122334', district: 'Colombo', status: 'ACTIVE' },
    { officerId: 'PC1002', firstName: 'Nimal', lastName: 'Jayasinghe', badgeNumber: 'B4412', phoneNumber: '0715566778', district: 'Kandy', status: 'ACTIVE' }
  ]);

  const [categories, setCategories] = useState([
    { categoryId: 'V001', name: 'Speeding Above Limit', fineAmount: 3000 },
    { categoryId: 'V002', name: 'Reckless Driving', fineAmount: 5000 },
    { categoryId: 'V003', name: 'Drunk Driving', fineAmount: 10000 },
    { categoryId: 'V004', name: 'Driving Without License', fineAmount: 6000 },
    { categoryId: 'V005', name: 'No Helmet / Seatbelt', fineAmount: 2000 },
    { categoryId: 'V006', name: 'Traffic Light Violation', fineAmount: 3000 }
  ]);

  // Form States
  const [officerForm, setOfficerForm] = useState({
    username: '', firstName: '', lastName: '', badgeNumber: '', phoneNumber: '', district: 'Colombo'
  });
  const [categoryForm, setCategoryForm] = useState({
    categoryId: '', name: '', fineAmount: ''
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Check backend connection and fetch live data
  const fetchData = async () => {
    if (!token) return;
    try {
      // Test endpoints via Gateway
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const dashboardRes = await fetch(`${API_BASE}/reports/dashboard`, { headers });
      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardData(data);
        setIsStandalone(false);
      } else {
        setIsStandalone(true);
      }

      const officersRes = await fetch(`${API_BASE}/admin/officers`, { headers });
      if (officersRes.ok) {
        const data = await officersRes.json();
        setOfficers(data);
      }

      const categoriesRes = await fetch(`${API_BASE}/categories`);
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }

    } catch (err) {
      console.warn('Backend API not available, falling back to mock mode.');
      setIsStandalone(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.role === 'ADMIN') {
          setToken(data.token);
          localStorage.setItem('admin_token', data.token);
          showNotification('Login Successful!');
        } else {
          setLoginError('Forbidden: Only Administrators can log in.');
        }
      } else {
        // Fallback for students local quick demo testing
        if (username === 'admin' && password === 'admin123') {
          setToken('mock_admin_token');
          localStorage.setItem('admin_token', 'mock_admin_token');
          setIsStandalone(true);
          showNotification('LoggedIn using Standalone Admin Account.');
        } else {
          setLoginError('Invalid username or password.');
        }
      }
    } catch (err) {
      // Fetch error: fallback offline auth for testing
      if (username === 'admin' && password === 'admin123') {
        setToken('mock_admin_token');
        localStorage.setItem('admin_token', 'mock_admin_token');
        setIsStandalone(true);
        showNotification('LoggedIn using Standalone Admin Account (Offline).');
      } else {
        setLoginError('API Server Offline. Use admin / admin123 to bypass.');
      }
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('admin_token');
    showNotification('Logged out successfully.');
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    try {
      if (isStandalone) {
        const newOfficer = { ...officerForm, officerId: officerForm.username, status: 'ACTIVE' };
        setOfficers([...officers, newOfficer]);
        showNotification(`Officer created. Default password: ${officerForm.username}123`);
        setOfficerForm({ username: '', firstName: '', lastName: '', badgeNumber: '', phoneNumber: '', district: 'Colombo' });
        return;
      }

      const res = await fetch(`${API_BASE}/admin/officers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(officerForm)
      });

      if (res.ok) {
        showNotification(`Officer profile and user login registered. Default password is "${officerForm.username}123".`);
        setOfficerForm({ username: '', firstName: '', lastName: '', badgeNumber: '', phoneNumber: '', district: 'Colombo' });
        fetchData();
      } else {
        const errorText = await res.text();
        showNotification(errorText || 'Failed to create officer', 'error');
      }
    } catch (err) {
      showNotification('Error contacting API gateway', 'error');
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (!confirm('Are you sure you want to delete this officer profile?')) return;
    try {
      if (isStandalone) {
        setOfficers(officers.filter(o => o.officerId !== id));
        showNotification('Officer deleted (Mock Mode)');
        return;
      }

      const res = await fetch(`${API_BASE}/admin/officers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Officer deleted successfully.');
        fetchData();
      }
    } catch (err) {
      showNotification('Error performing delete', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      if (isStandalone) {
        const newCat = { 
          categoryId: categoryForm.categoryId, 
          name: categoryForm.name, 
          fineAmount: parseFloat(categoryForm.fineAmount) 
        };
        setCategories([...categories, newCat]);
        showNotification('Fine Category created (Mock Mode)');
        setCategoryForm({ categoryId: '', name: '', fineAmount: '' });
        return;
      }

      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryId: categoryForm.categoryId,
          name: categoryForm.name,
          fineAmount: parseFloat(categoryForm.fineAmount)
        })
      });

      if (res.ok) {
        showNotification('Fine category registered successfully.');
        setCategoryForm({ categoryId: '', name: '', fineAmount: '' });
        fetchData();
      } else {
        showNotification('Failed to create category', 'error');
      }
    } catch (err) {
      showNotification('Error calling API', 'error');
    }
  };

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#070A13] px-4">
        <div className="max-w-md w-full space-y-8 p-8 glass-panel rounded-2xl border border-slate-800 glow-blue text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4 animate-pulse">
              <Shield className="h-12 w-12 text-[#5BC0BE]" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">SRI LANKA POLICE</h2>
            <p className="mt-2 text-sm text-slate-400">Traffic Fine Management System - Admin Portal</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="sr-only">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-700 bg-slate-900/60 placeholder-slate-500 text-slate-100 rounded-lg focus:outline-none focus:ring-[#5BC0BE] focus:border-[#5BC0BE] focus:z-10 sm:text-sm"
                  placeholder="Admin Username (admin)"
                />
              </div>
              <div>
                <label className="sr-only">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-700 bg-slate-900/60 placeholder-slate-500 text-slate-100 rounded-lg focus:outline-none focus:ring-[#5BC0BE] focus:border-[#5BC0BE] focus:z-10 sm:text-sm"
                  placeholder="Password (admin123)"
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-slate-950 bg-[#5BC0BE] hover:bg-[#4ea8a6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5BC0BE] transition-colors"
              >
                Sign In Securely
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#06080E] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/70 border-r border-slate-800 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-800">
            <Shield className="h-8 w-8 text-[#5BC0BE]" />
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white">SL POLICE ADMIN</h1>
              <span className="text-[10px] text-emerald-400 font-medium">Secured Node</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#5BC0BE]/15 text-[#5BC0BE] border-l-4 border-[#5BC0BE]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <BarChart2 className="h-5 w-5" />
              <span>Dashboard Analytics</span>
            </button>
            <button 
              onClick={() => setActiveTab('register')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'register' ? 'bg-[#5BC0BE]/15 text-[#5BC0BE] border-l-4 border-[#5BC0BE]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <PlusCircle className="h-5 w-5" />
              <span>Register Officer</span>
            </button>
            <button 
              onClick={() => setActiveTab('officers')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'officers' ? 'bg-[#5BC0BE]/15 text-[#5BC0BE] border-l-4 border-[#5BC0BE]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Users className="h-5 w-5" />
              <span>Manage Officers</span>
            </button>
            <button 
              onClick={() => setActiveTab('categories')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-[#5BC0BE]/15 text-[#5BC0BE] border-l-4 border-[#5BC0BE]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Sliders className="h-5 w-5" />
              <span>Fine Categories</span>
            </button>
          </nav>
        </div>

        <div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="bg-slate-900/40 border-b border-slate-800/60 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-tight text-white capitalize">{activeTab.replace('-', ' ')}</h2>
            {isStandalone && (
              <span className="bg-[#FFD700]/10 text-[#FFD700] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#FFD700]/20 flex items-center">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Offline Mock Mode
              </span>
            )}
          </div>
          <button 
            onClick={fetchData} 
            className="flex items-center text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Feed
          </button>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-8">
          {notification && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 ${notification.type === 'error' ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'}`}>
              {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              <span className="text-sm">{notification.message}</span>
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 glow-blue flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Fine Collections</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">Rs. {dashboardData.totalRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] text-emerald-400 mt-1">★ 100% Secure Node Ledger</p>
                  </div>
                  <div className="p-3.5 bg-[#5BC0BE]/15 rounded-2xl border border-[#5BC0BE]/30">
                    <DollarSign className="h-6 w-6 text-[#5BC0BE]" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-800 glow-gold flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Settled Violations</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{dashboardData.totalFinesPaid} Fines</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Immediate Release Enabled</p>
                  </div>
                  <div className="p-3.5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                    <FileText className="h-6 w-6 text-[#FFD700]" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Police Force</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{officers.length} Officers</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Cross-District Patrols</p>
                  </div>
                  <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <Users className="h-6 w-6 text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* District & Category breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* District Collections */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                  <h4 className="font-bold text-white text-base mb-4 flex items-center">
                    <MapPin className="h-4 w-4 text-[#5BC0BE] mr-2" />
                    District-wise Revenue Breakdown
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs uppercase bg-slate-900/60 text-slate-400">
                        <tr>
                          <th className="p-3 rounded-l-lg">District</th>
                          <th className="p-3">Total Fines Settled</th>
                          <th className="p-3 text-right rounded-r-lg">Total Collections (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {dashboardData.districtSummaries.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="p-3 font-semibold text-white">{item.district}</td>
                            <td className="p-3 text-slate-400">{item.totalFinesPaid}</td>
                            <td className="p-3 text-right font-semibold text-[#5BC0BE]">Rs. {item.totalAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Category Breakdowns */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                  <h4 className="font-bold text-white text-base mb-4 flex items-center">
                    <Award className="h-4 w-4 text-[#FFD700] mr-2" />
                    Category Collections Breakdown
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs uppercase bg-slate-900/60 text-slate-400">
                        <tr>
                          <th className="p-3 rounded-l-lg">Violation ID</th>
                          <th className="p-3">Violation Category</th>
                          <th className="p-3 text-right rounded-r-lg">Fines Collected (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {dashboardData.categorySummaries.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="p-3 font-semibold text-slate-400">{item.categoryId}</td>
                            <td className="p-3 text-white font-medium">{item.categoryName}</td>
                            <td className="p-3 text-right font-semibold text-[#FFD700]">Rs. {item.totalAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REGISTER OFFICER */}
          {activeTab === 'register' && (
            <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-slate-800 glow-blue">
              <h3 className="text-xl font-bold text-white mb-6">Register a New Traffic Officer</h3>
              <form onSubmit={handleCreateOfficer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Officer Username / ID</label>
                    <input 
                      type="text" required
                      value={officerForm.username}
                      onChange={e => setOfficerForm({...officerForm, username: e.target.value})}
                      placeholder="e.g. PC5532"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Badge Number</label>
                    <input 
                      type="text" required
                      value={officerForm.badgeNumber}
                      onChange={e => setOfficerForm({...officerForm, badgeNumber: e.target.value})}
                      placeholder="e.g. B-5532"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                    <input 
                      type="text" required
                      value={officerForm.firstName}
                      onChange={e => setOfficerForm({...officerForm, firstName: e.target.value})}
                      placeholder="First Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                    <input 
                      type="text" required
                      value={officerForm.lastName}
                      onChange={e => setOfficerForm({...officerForm, lastName: e.target.value})}
                      placeholder="Last Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input 
                      type="text" required
                      value={officerForm.phoneNumber}
                      onChange={e => setOfficerForm({...officerForm, phoneNumber: e.target.value})}
                      placeholder="e.g. 0771122334"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">District Jurisdiction</label>
                    <select 
                      value={officerForm.district}
                      onChange={e => setOfficerForm({...officerForm, district: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE]"
                    >
                      <option value="Colombo">Colombo</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Matara">Matara</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-slate-400 text-xs flex items-start space-x-3">
                  <Shield className="h-4 w-4 text-[#FFD700] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-1">Authorization Credentials</p>
                    <p>Submitting this form registers credentials in the <code className="text-[#5BC0BE]">auth_db</code>. Officers cannot self-register. The default password is the username followed by "123".</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#5BC0BE] hover:bg-[#4ba8a6] text-slate-950 font-bold rounded-lg transition-colors shadow-lg shadow-[#5BC0BE]/10"
                >
                  Create Officer Account
                </button>
              </form>
            </div>
          )}

          {/* TAB: OFFICERS LIST */}
          {activeTab === 'officers' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6">Registered Police Officers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-900/60 text-slate-400">
                    <tr>
                      <th className="p-3">Badge Number</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {officers.map((officer, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30">
                        <td className="p-3 font-semibold text-[#5BC0BE]">{officer.badgeNumber}</td>
                        <td className="p-3 font-medium text-white">{officer.firstName} {officer.lastName}</td>
                        <td className="p-3 text-slate-400">{officer.officerId}</td>
                        <td className="p-3 text-slate-400">{officer.phoneNumber}</td>
                        <td className="p-3 text-slate-300">{officer.district}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${officer.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                            {officer.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleDeleteOfficer(officer.officerId)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all"
                            title="Delete Profile"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FINE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* List of categories */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6">Traffic Violation Fine Categories</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-900/60 text-slate-400">
                      <tr>
                        <th className="p-3 rounded-l-lg">ID</th>
                        <th className="p-3">Violation</th>
                        <th className="p-3 text-right rounded-r-lg">Fine Amount (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {categories.map((cat, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-3 font-semibold text-slate-400">{cat.categoryId}</td>
                          <td className="p-3 text-white font-medium">{cat.name}</td>
                          <td className="p-3 text-right font-semibold text-[#FFD700]">Rs. {cat.fineAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add category form */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 glow-gold h-fit">
                <h3 className="text-lg font-bold text-white mb-4">Add Fine Category</h3>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Category Identifier</label>
                    <input 
                      type="text" required
                      value={categoryForm.categoryId}
                      onChange={e => setCategoryForm({...categoryForm, categoryId: e.target.value})}
                      placeholder="e.g. V007"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Violation Offense Name</label>
                    <input 
                      type="text" required
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="e.g. No Driving License"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Fine Amount (Rs.)</label>
                    <input 
                      type="number" required
                      value={categoryForm.fineAmount}
                      onChange={e => setCategoryForm({...categoryForm, fineAmount: e.target.value})}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#FFD700] hover:bg-[#e0be00] text-slate-950 font-bold rounded-lg transition-colors shadow-lg shadow-[#FFD700]/10"
                  >
                    Save Category
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
