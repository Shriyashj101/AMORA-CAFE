import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Cart Items List */}
        <div>
          {cartItems.length === 0 ? (
            <div>
              <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Your cart is empty.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain', background: 'white', borderRadius: '0.5rem' }} />
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item._id}`}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.name}</h3>
                    </Link>
                    <span style={{ fontWeight: 'bold' }}>${item.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span style={{ marginRight: '1rem' }}>Qty: {item.qty}</span>
                    <button onClick={() => removeFromCart(item._id)} style={{ color: 'var(--danger-color)', fontWeight: 'bold', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Items ({totalItems}):</span>
            <span>${totalPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Shipping:</span>
            <span>${totalItems > 0 ? '10.00' : '0.00'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total:</span>
            <span>${totalItems > 0 ? (parseFloat(totalPrice) + 10).toFixed(2) : '0.00'}</span>
          </div>
          <Link to="/checkout" style={{ pointerEvents: totalItems === 0 ? 'none' : 'auto' }}>
            <button className="btn btn-primary btn-block" disabled={totalItems === 0} style={{ padding: '1rem', fontSize: '1.1rem' }}>
              Proceed To Checkout
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
