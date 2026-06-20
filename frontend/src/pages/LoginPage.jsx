import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || "https://amora-cafe-backend.onrender.com/api";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('cook'); // 'cook' | 'admin'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('aroma_token');
    const user = JSON.parse(localStorage.getItem('aroma_user') || '{}');
    if (token && user.role === 'admin') {
      navigate('/admin');
    } else if (token && user.role === 'cook') {
      navigate('/cook');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        loginId,
        password
      });

      // Verify the role matches the active tab
      if (res.data.role !== activeTab) {
        setErrorMessage(`Access Denied: Logged-in user is not configured as an ${activeTab === 'admin' ? 'Owner/Admin' : 'Cook'}.`);
        setLoading(false);
        return;
      }

      // Save token & user profile
      localStorage.setItem('aroma_token', res.data.token);
      localStorage.setItem('aroma_user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        loginId: res.data.loginId,
        role: res.data.role
      }));

      // Redirect
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/cook');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '1rem' }}>
      
      <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', color: 'var(--text-light)', marginBottom: '2rem', fontWeight: 600 }}>
        <FiArrowLeft /> Back to Customer Menu
      </button>

      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', background: 'var(--card-bg)', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--primary-color)', marginTop: '0.5rem' }}>Staff Portal</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Aroma Cafe Operations System</p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '50px', overflow: 'hidden', marginBottom: '2rem', background: 'var(--bg-color)', padding: '3px' }}>
          <button
            style={{
              flex: 1,
              padding: '0.6rem 0',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'cook' ? 'var(--bg-color)' : 'var(--text-light)',
              background: activeTab === 'cook' ? 'var(--primary-color)' : 'transparent',
            }}
            onClick={() => {
              setActiveTab('cook');
              setLoginId('');
              setPassword('');
              setErrorMessage('');
            }}
          >
            🍳 Cook Login
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.6rem 0',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'admin' ? 'var(--bg-color)' : 'var(--text-light)',
              background: activeTab === 'admin' ? 'var(--primary-color)' : 'transparent',
            }}
            onClick={() => {
              setActiveTab('admin');
              setLoginId('');
              setPassword('');
              setErrorMessage('');
            }}
          >
            👑 Owner/Admin
          </button>
        </div>

        {errorMessage && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'admin' ? 'Admin ID' : 'Cook ID'}
            </label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder={activeTab === 'admin' ? 'e.g. admin' : 'e.g. cook1'}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : `Enter ${activeTab === 'admin' ? 'Owner' : 'Kitchen'} Portal`}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', background: 'var(--bg-color)', padding: '0.8rem', borderRadius: '8px' }}>
          💡 Seeded Demo logins:<br/>
          <b>Cook:</b> cook1 / cook123<br/>
          <b>Admin:</b> admin / admin123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
