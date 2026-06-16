import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>User Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'var(--accent-color)' }}>My Profile</strong></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/settings" style={{ color: 'var(--text-light)' }}>Settings</Link></li>
            <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>Logout</button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <h2>Welcome back, User!</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Manage your account, track orders, and view your wishlist from your dashboard.</p>
          </div>

          <h3>Recent Orders</h3>
          <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                    No recent orders found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
