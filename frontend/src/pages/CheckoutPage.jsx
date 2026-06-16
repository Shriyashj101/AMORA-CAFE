import { useState } from 'react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  const [step, setStep] = useState(1);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Secure Checkout</h1>
      
      {/* Checkout Steps Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'var(--border-color)', zIndex: '-1' }}></div>
        {['Shipping', 'Payment', 'Place Order'].map((label, index) => (
          <div key={label} style={{ background: 'var(--bg-color)', padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= index + 1 ? 'var(--accent-color)' : 'var(--border-color)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {index + 1}
            </div>
            <span style={{ color: step >= index + 1 ? 'var(--text-main)' : 'var(--text-light)', fontWeight: 'bold' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Shipping Address</h2>
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input type="text" className="form-control" placeholder="123 Main St" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-control" placeholder="City" />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input type="text" className="form-control" placeholder="Postal Code" />
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => setStep(2)}>Continue to Payment</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Payment Method</h2>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                <input type="radio" name="payment" defaultChecked />
                <span>Credit Card / Stripe</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="payment" />
                <span>Razorpay</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Review Order</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Review & Place Order</h2>
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <p><strong>Shipping:</strong> 123 Main St, City, 12345</p>
              <p><strong>Payment:</strong> Stripe</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>
              <span>Total:</span>
              <span>$0.00</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2, background: 'var(--success-color)' }}>Confirm Purchase</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
