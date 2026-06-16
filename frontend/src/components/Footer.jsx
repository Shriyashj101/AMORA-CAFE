const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>☕ Aroma Cafe</h3>
            <p style={{ color: 'var(--border-color)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Where every cup tells a story. We serve organic, ethically sourced specialty beans and handmade gourmet snacks.
            </p>
          </div>
          <div className="footer-section">
            <h3>🕒 Opening Hours</h3>
            <p style={{ color: 'var(--border-color)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Monday - Sunday: 7:00 AM - 10:00 PM
            </p>
          </div>
          <div className="footer-section">
            <h3>📍 Find Us</h3>
            <p style={{ color: 'var(--border-color)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              123 Coffee Bean Lane, Gourmet City<br />
              Phone: +91 98765 43210
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aroma Cafe. All rights reserved.</p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>Premium Culinary Operations System</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
