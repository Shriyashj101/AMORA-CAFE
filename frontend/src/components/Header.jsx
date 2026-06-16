import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMoon, FiSun, FiLayers } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Header = ({ toggleTheme, theme }) => {
  const [cartCount, setCartCount] = useState(0);

  // Poll localStorage for cart items to keep badge updated
  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('aroma_cart') || '[]');
      const count = cart.reduce((total, item) => total + item.qty, 0);
      setCartCount(count);
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    // Poll every 1 second in case storage events don't fire on same tab
    const interval = setInterval(updateCount, 1000);

    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <header>
      <div className="nav-container">
        <Link to="/" className="logo">
          <span>☕</span> Aroma <span className="logo-highlight">Cafe</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Menu</Link>
          <Link to="/cook" className="nav-link">
            <FiLayers size={18} /> Cook Portal
          </Link>
          <Link to="/login" className="nav-link">
            <FiUser size={18} /> Staff Portal
          </Link>
          <button onClick={toggleTheme} className="nav-link" aria-label="Toggle Theme" style={{ cursor: 'pointer' }}>
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
