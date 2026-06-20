import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLogOut, FiPlay, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || "https://amora-cafe-backend.onrender.com/api";

const CookDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const ordersCountRef = useRef(0);

  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('aroma_token');
    const user = JSON.parse(localStorage.getItem('aroma_user') || '{}');
    if (!token || user.role !== 'cook') {
      localStorage.removeItem('aroma_token');
      localStorage.removeItem('aroma_user');
      navigate('/login');
      return;
    }
    setUserName(user.name || 'Cook');
    
    // Initial fetch
    fetchActiveOrders();

    // 3-second polling for live kitchen orders
    const interval = setInterval(fetchActiveOrders, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Synthesize double-note chime using Web Audio API (C5 & G5)
  const playNewOrderChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      
      // Note 1: C5 (523.25 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.3);

      // Note 2: G5 (783.99 Hz) playing slightly delayed
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.6);
      
      console.log('Web Audio notification chime triggered successfully');
    } catch (err) {
      console.warn('AudioContext beep blocked or failed:', err);
    }
  };

  const fetchActiveOrders = async () => {
    const token = localStorage.getItem('aroma_token');
    if (!token) return;

    try {
      // Fetch orders that are not Served yet (Received, Preparing, Ready)
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const resReceived = await axios.get(`${API_URL}/orders?status=Received`, config);
      const resPreparing = await axios.get(`${API_URL}/orders?status=Preparing`, config);
      const resReady = await axios.get(`${API_URL}/orders?status=Ready`, config);

      // Combine orders
      const activeOrders = [...resReceived.data, ...resPreparing.data, ...resReady.data];
      
      // Sort: FIFO (First-in, First-out) based on date
      activeOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setOrders(activeOrders);
      setError('');

      // Play alert chime if a new order has arrived
      const previousCount = ordersCountRef.current;
      const currentCount = activeOrders.filter(o => o.status === 'Received').length;
      if (currentCount > previousCount) {
        playNewOrderChime();
      }
      ordersCountRef.current = currentCount;

    } catch (err) {
      setError('Connection to kitchen network lost. Reconnecting...');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const token = localStorage.getItem('aroma_token');
    if (!token) return;

    let nextStatus = '';
    if (currentStatus === 'Received') {
      nextStatus = 'Preparing';
    } else if (currentStatus === 'Preparing') {
      nextStatus = 'Ready';
    } else {
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.put(`${API_URL}/orders/${id}/status`, { status: nextStatus }, config);
      
      // Optimistic updates
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === id ? { ...order, status: nextStatus } : order
        )
      );
      fetchActiveOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aroma_token');
    localStorage.removeItem('aroma_user');
    navigate('/login');
  };

  // Helper to calculate minutes elapsed
  const getMinutesElapsed = (timestamp) => {
    const diffMs = new Date() - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 1000 / 60);
    return diffMins;
  };

  return (
    <div style={{ padding: '1.5rem', minHeight: '80vh' }}>
      
      {/* Dashboard Top Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Portal Mode: Kitchen</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--primary-color)', marginTop: '0.2rem' }}>
            🍳 Live Kitchen Screen
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Welcome, {userName}. Prepare orders in sequence.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ borderRadius: '50px' }}>
          Logout <FiLogOut />
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', border: '1px solid #fef08a', color: '#a16207', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <FiAlertCircle /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear' }}>🌀</div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading active kitchen queue...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '6rem', padding: '3rem', background: 'var(--card-bg)', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '4rem' }}>🛎️</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginTop: '1.5rem' }}>All orders caught up!</h2>
          <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Sit back, relax, or keep the tools clean. New orders will chime automatically.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ background: 'var(--accent-color)', color: 'white', padding: '0.35rem 0.9rem', borderRadius: '50px', fontWeight: 800, fontSize: '0.85rem' }}>
              {orders.length} Active Orders
            </span>
            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Sorted by oldest waiting order (FIFO)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {orders.map((order, idx) => {
              const minutesWaiting = getMinutesElapsed(order.createdAt);
              let statusColor = '#3b82f6'; // Received blue
              let cardBorder = 'var(--border-color)';
              
              if (order.status === 'Preparing') {
                statusColor = 'var(--accent-color)'; // Preparing Amber
                cardBorder = 'var(--accent-color)';
              } else if (order.status === 'Ready') {
                statusColor = 'var(--success-color)'; // Ready Mint
              }

              return (
                <div
                  key={order._id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    border: `2px solid ${cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    animation: 'fadeIn 0.2s ease',
                    boxShadow: order.status === 'Received' && minutesWaiting > 10 ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  {/* Status Tag */}
                  <span style={{
                    position: 'absolute',
                    top: '1.2rem',
                    right: '1.2rem',
                    background: statusColor,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700 }}>
                      QUEUE #{idx + 1}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', margin: '0.2rem 0 0.8rem 0', color: 'var(--primary-color)' }}>
                      {order.orderId}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: minutesWaiting > 10 && order.status !== 'Ready' ? 'var(--danger-color)' : 'var(--text-light)', fontWeight: 600, marginBottom: '1.2rem' }}>
                      <FiClock /> Waiting: {minutesWaiting} mins
                    </div>

                    <div style={{ background: 'var(--bg-color)', padding: '0.8rem 1.2rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 700, display: 'block', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                        🍽️ Table: {order.tableNumber}
                      </span>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {order.orderItems.map((item, index) => (
                          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                            <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>x {item.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cook Actions */}
                  <div>
                    {order.status === 'Received' && (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => handleUpdateStatus(order._id, 'Received')}
                      >
                        <FiPlay /> Accept & Start Preparing
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        className="btn btn-accent btn-block"
                        onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                      >
                        <FiCheck /> Mark as Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <div style={{ textAlign: 'center', color: 'var(--success-color)', fontWeight: 700, fontSize: '0.9rem', background: '#ecfdf5', padding: '0.5rem', borderRadius: '50px', border: '1px solid #a7f3d0' }}>
                        ✓ Food ready for serving
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CookDashboard;
