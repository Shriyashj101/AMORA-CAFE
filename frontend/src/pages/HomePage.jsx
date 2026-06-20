import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiShoppingCart, FiSearch, FiCheckCircle, FiClock, FiStar, FiChevronRight, FiMinus, FiPlus, FiTrash2, FiShare2 } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || "https://amora-cafe-backend.onrender.com/api";

const HomePage = () => {
  // Menu and State
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [keyword, setKeyword] = useState('');
  const [specials, setSpecials] = useState([]);
  const [popular, setPopular] = useState([]);
  
  // Cart
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  
  // Customer & Loyalty
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isTableLocked, setIsTableLocked] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);
  
  // Placement & Tracking
  const [placedOrder, setPlacedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [timeString, setTimeString] = useState('');

  const menuRef = useRef(null);

  // Time & Date Updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Menu, Specials, and Check URL Table parameter
  useEffect(() => {
    // Check for QR Table Parameter e.g. /?table=15
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      const parsedTable = parseInt(tableParam);
      if (parsedTable >= 1 && parsedTable <= 30) {
        setTableNumber(`Table ${parsedTable}`);
        setIsTableLocked(true);
      }
    }

    // Load Cart from localStorage
    const savedCart = localStorage.getItem('aroma_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    fetchMenu();
    fetchSpecials();
  }, []);

  // Update localStorage when cart changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('aroma_cart', JSON.stringify(newCart));
    // Trigger custom event so header updates badge count
    window.dispatchEvent(new Event('storage'));
  };

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
      // Determine popular items (highest popularity count)
      const sortedByPopularity = [...res.data]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 4);
      setPopular(sortedByPopularity);
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const fetchSpecials = async () => {
    try {
      const res = await axios.get(`${API_URL}/products?special=true`);
      setSpecials(res.data);
    } catch (err) {
      console.error('Error fetching specials:', err);
    }
  };

  // Lookup Customer Loyalty points on mobile input change
  const handleMobileBlur = async () => {
    if (customerMobile.length >= 10) {
      try {
        const res = await axios.get(`${API_URL}/customer/${customerMobile}`);
        if (res.data) {
          setLoyaltyPoints(res.data.loyaltyPoints);
          if (res.data.name) {
            setCustomerName(res.data.name);
          }
        }
      } catch (err) {
        console.error('Error looking up customer:', err);
      }
    }
  };

  // Menu Category List
  const categoriesList = [
    { name: 'All', icon: '🍽️' },
    { name: 'Meals', icon: '🍔' },
    { name: 'Coffees', icon: '☕' },
    { name: 'Cold Drinks', icon: '🥤' },
    { name: 'Snacks', icon: '🍟' },
    { name: 'Desserts', icon: '🍰' },
    { name: 'Healthy Items', icon: '🥗' }
  ];

  // Filtering Menu Items
  const filteredProducts = products.filter(product => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesKeyword = product.name.toLowerCase().includes(keyword.toLowerCase()) || 
                          product.description.toLowerCase().includes(keyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  // Cart operations
  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product._id);
    let newCart;
    if (existing) {
      newCart = cart.map(item =>
        item.product === product._id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      newCart = [...cart, {
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1
      }];
    }
    saveCart(newCart);
  };

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    const newCart = cart.map(item =>
      item.product === id ? { ...item, qty: newQty } : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.product !== id);
    saveCart(newCart);
  };

  // Coupon handling
  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await axios.get(`${API_URL}/coupons/validate/${couponCode}`);
      if (res.data.valid) {
        setCouponDiscount(res.data.discountPercentage);
        setCouponApplied(res.data.code);
        alert(`Coupon ${res.data.code} applied successfully! You got ${res.data.discountPercentage}% off.`);
      } else {
        alert(res.data.message || 'Invalid Coupon Code');
        setCouponDiscount(0);
        setCouponApplied('');
      }
    } catch (err) {
      console.error('Coupon error:', err);
    }
  };

  // Calculations
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  const getCalculations = () => {
    const subtotal = getSubtotal();
    
    // Percentage coupon discount
    let couponDiscountValue = (subtotal * couponDiscount) / 100;
    
    // Loyalty point redemption discount
    let loyaltyDiscount = 0;
    if (redeemPoints) {
      loyaltyDiscount = Math.min(loyaltyPoints, subtotal - couponDiscountValue);
    }

    const discount = parseFloat((couponDiscountValue + loyaltyDiscount).toFixed(2));
    const taxableAmount = Math.max(0, subtotal - discount);
    
    const gst = parseFloat((taxableAmount * 0.05).toFixed(2)); // 5% GST
    const serviceCharge = parseFloat((taxableAmount * 0.02).toFixed(2)); // 2% Service Charge
    const grandTotal = parseFloat((taxableAmount + gst + serviceCharge).toFixed(2));

    return { subtotal, discount, gst, serviceCharge, grandTotal, loyaltyDiscount };
  };

  const calcs = getCalculations();

  // Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (!tableNumber) {
      alert('Please select a table number!');
      return;
    }

    const orderData = {
      orderItems: cart,
      tableNumber,
      customerName,
      customerMobile,
      couponCode: couponApplied,
      redeemPoints,
      branch: 'Main Branch'
    };

    try {
      const res = await axios.post(`${API_URL}/orders`, orderData);
      setPlacedOrder(res.data);
      setOrderStatus(res.data.status);
      saveCart([]); // clear cart
      setIsCartOpen(false);
      setRedeemPoints(false);
      setLoyaltyPoints(0);
      setCouponApplied('');
      setCouponDiscount(0);
      setCouponCode('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order');
    }
  };

  // Status Poller for Placed Order
  useEffect(() => {
    if (!placedOrder) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/${placedOrder.orderId}`);
        setOrderStatus(res.data.status);
        if (res.data.status === 'Served') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [placedOrder]);

  // Submit Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!placedOrder) return;
    try {
      await axios.post(`${API_URL}/feedback`, {
        orderId: placedOrder.orderId,
        rating: feedbackRating,
        review: feedbackComment
      });
      setFeedbackSubmitted(true);
      alert('Thank you for your valuable feedback!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // WhatsApp Bill Builder
  const getWhatsAppShareLink = () => {
    if (!placedOrder) return '';
    const text = `*☕ Aroma Cafe Bill Details*
----------------------------
*Order ID:* ${placedOrder.orderId}
*Table:* ${placedOrder.tableNumber}
*Status:* ${orderStatus}
----------------------------
*Items:*
${placedOrder.orderItems.map(item => `- ${item.name} x ${item.qty} (₹${item.price})`).join('\n')}
----------------------------
*Subtotal:* ₹${placedOrder.subtotal}
*Discount:* ₹${placedOrder.discount}
*GST (5%):* ₹${placedOrder.gst}
*Service Charge (2%):* ₹${placedOrder.serviceCharge}
*Grand Total:* ₹${placedOrder.grandTotal}
----------------------------
Thank you for choosing Aroma Cafe! 😊`;

    const cleanedMobile = customerMobile ? customerMobile.replace(/\D/g, '') : '';
    const phoneParam = cleanedMobile ? `phone=${cleanedMobile.startsWith('91') || cleanedMobile.length > 10 ? cleanedMobile : '91' + cleanedMobile}&` : '';
    return `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`;
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 1. WELCOME SCREEN / HERO BANNER */}
      {!placedOrder && (
        <section style={{
          position: 'relative',
          borderRadius: '2rem',
          overflow: 'hidden',
          marginBottom: '3rem',
          minHeight: '450px',
          backgroundImage: 'linear-gradient(rgba(45, 30, 24, 0.6), rgba(45, 30, 24, 0.85)), url("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem',
          color: '#faf6f0',
          boxShadow: '0 10px 30px rgba(78, 54, 41, 0.15)'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(5px)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>
            🕒 {timeString || 'Loading time...'}
          </div>

          <span style={{ fontSize: '3.5rem', marginBottom: '1rem', animation: 'bounce 2s infinite' }}>☕</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Welcome to Aroma Cafe
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', lineHeight: 1.5, color: '#ebdccb', marginBottom: '2rem', fontWeight: 300 }}>
            Hello! We're happy to serve you today. Please place your order, sit back, and enjoy your fresh meal.
          </p>

          <button className="btn btn-accent btn-large" onClick={() => menuRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Start Order <FiChevronRight />
          </button>
        </section>
      )}

      {/* 2. ORDER CONFIRMATION / TRACKER VIEW */}
      {placedOrder && (
        <section className="glass-card" style={{ maxWidth: '750px', margin: '1rem auto 4rem auto', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <FiCheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--primary-color)' }}>
              Thank you for choosing Aroma Cafe
            </h2>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
              Your order has been successfully placed.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--border-color)', color: 'var(--primary-color)', padding: '0.5rem 1.2rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem', marginTop: '1rem' }}>
              <FiClock /> Estimated Preparation: 30 mins
            </div>
          </div>

          {/* Live Order Status Stepper */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.4)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-color)' }}>
              Live Order Tracker
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 1rem' }}>
              {/* Stepper progress line */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '0',
                right: '0',
                height: '4px',
                background: 'var(--border-color)',
                zIndex: 1
              }}></div>
              
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '0',
                width: orderStatus === 'Received' ? '0%' : orderStatus === 'Preparing' ? '33%' : orderStatus === 'Ready' ? '66%' : '100%',
                height: '4px',
                background: 'var(--accent-color)',
                transition: 'width 0.5s ease',
                zIndex: 2
              }}></div>

              {/* Steps */}
              {['Received', 'Preparing', 'Ready', 'Served'].map((step, idx) => {
                const stepOrder = ['Received', 'Preparing', 'Ready', 'Served'];
                const currentIdx = stepOrder.indexOf(orderStatus);
                const stepIdx = stepOrder.indexOf(step);
                const isActive = stepIdx <= currentIdx;
                
                return (
                  <div key={step} style={{ zIndex: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isActive ? 'var(--accent-color)' : 'var(--card-bg)',
                      border: `3px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      color: isActive ? 'white' : 'var(--text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      transition: 'all 0.3s ease'
                    }}>
                      {stepIdx + 1}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-main)' : 'var(--text-light)', marginTop: '0.5rem' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt display */}
          <div style={{ border: '2px dashed var(--border-color)', padding: '2rem', borderRadius: '1rem', background: 'var(--card-bg)', fontFamily: 'monospace', color: '#333' }}>
            <h4 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>🧾 AROMA CAFE INVOICE</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Order ID:</span>
              <span>{placedOrder.orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Table:</span>
              <span>{placedOrder.tableNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span>Date:</span>
              <span>{new Date(placedOrder.timestamp).toLocaleDateString('en-IN')}</span>
            </div>

            <div style={{ borderBottom: '1px dashed #999', marginBottom: '1rem' }}></div>

            {placedOrder.orderItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{item.name} x {item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}

            <div style={{ borderBottom: '1px dashed #999', margin: '1rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Subtotal:</span>
              <span>₹{placedOrder.subtotal}</span>
            </div>
            {placedOrder.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: 'green' }}>
                <span>Discount:</span>
                <span>-₹{placedOrder.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>GST (5%):</span>
              <span>₹{placedOrder.gst}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Service Charge (2%):</span>
              <span>₹{placedOrder.serviceCharge}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              <span>GRAND TOTAL:</span>
              <span>₹{placedOrder.grandTotal}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <a href={getWhatsAppShareLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1 }}>
              <FiShare2 /> Share Bill on WhatsApp
            </a>
            <button className="btn btn-secondary" onClick={() => setPlacedOrder(null)}>Order Something Else</button>
          </div>

          {/* Feedback Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2.5rem', paddingTop: '2rem' }}>
            {!feedbackSubmitted ? (
              <form onSubmit={handleFeedbackSubmit}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Rate your experience</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={28}
                      onClick={() => setFeedbackRating(star)}
                      style={{ cursor: 'pointer', fill: star <= feedbackRating ? 'var(--accent-color)' : 'none', stroke: 'var(--accent-color)' }}
                    />
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Add a comment (optional)</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Tell us what you liked or how we can improve..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-accent">Submit Feedback</button>
              </form>
            ) : (
              <div style={{ background: 'var(--border-color)', padding: '1.2rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--primary-color)' }}>
                🎉 Feedback submitted successfully! Thanks for helping us grow.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. MENU SYSTEM FOR CUSTOMERS */}
      {!placedOrder && (
        <div ref={menuRef} style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Today's Specials Banner */}
          {specials.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h2 className="category-title">🌟 Chef's Specials for Today</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {specials.map(prod => (
                  <div key={prod._id} className="glass-card" style={{ padding: '1.2rem', border: '2px solid var(--accent-color)', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={prod.image} alt={prod.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.8rem' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>{prod.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '0.2rem 0' }}>{prod.category}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>₹{prod.price}</span>
                        <button className="btn btn-accent" style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem' }} onClick={() => addToCart(prod)}>+ Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories card grid */}
          <div className="categories-container">
            <h2 className="category-title">Browse Our Menu</h2>
            
            {/* Search Bar */}
            <div style={{ maxWidth: '500px', margin: '0 auto 2rem auto', position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search coffee, burger, sandwich..."
                style={{ paddingLeft: '2.5rem', borderRadius: '50px' }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="category-grid">
              {categoriesList.map(cat => (
                <div
                  key={cat.name}
                  className={`category-card ${category === cat.name ? 'active' : ''}`}
                  onClick={() => setCategory(cat.name)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="product-grid" style={{ marginBottom: '4rem' }}>
            {filteredProducts.map(prod => (
              <div className="product-card" key={prod._id}>
                {prod.isSpecial && <span className="special-badge">Today's Special</span>}
                <div className="product-image-wrapper">
                  <img src={prod.image} alt={prod.name} className="product-img" onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
                  }} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{prod.name}</h3>
                  <p className="product-desc">{prod.description}</p>
                  <div className="product-footer">
                    <span className="product-price">₹{prod.price}</span>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem' }} onClick={() => addToCart(prod)}>
                      Add to order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Items Carousel/Section */}
          {popular.length > 0 && (
            <div style={{ background: 'rgba(78, 54, 41, 0.04)', padding: '3rem 0', borderRadius: '2rem', marginBottom: '3rem' }}>
              <div className="container">
                <h2 className="category-title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>🔥 Best Selling Products</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  {popular.map(prod => (
                    <div key={prod._id} className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--card-bg)' }}>
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '0.8rem', marginBottom: '0.8rem' }} />
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{prod.name}</h4>
                      <p style={{ color: 'var(--accent-color)', fontWeight: 800, marginTop: '0.4rem' }}>₹{prod.price}</p>
                      <button className="btn btn-secondary btn-block" style={{ marginTop: '0.8rem', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem' }} onClick={() => addToCart(prod)}>
                        Add to Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. FLOATING BASKET TRIGGER BAR */}
      {!placedOrder && cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '600px',
          background: 'var(--primary-color)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(45,30,24,0.3)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--accent-color)', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 800 }}>
              {cart.reduce((sum, item) => sum + item.qty, 0)} items
            </div>
            <span style={{ fontWeight: 600 }}>Total: ₹{calcs.grandTotal}</span>
          </div>
          <button className="btn btn-accent" style={{ border: 'none', padding: '0.5rem 1.5rem' }} onClick={() => setIsCartOpen(true)}>
            View Bill Details <FiShoppingCart style={{ marginLeft: '0.3rem' }} />
          </button>
        </div>
      )}

      {/* 5. CART / CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--primary-color)' }}>Your Selection</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-light)', border: 'none' }}>×</button>
            </div>
            
            <div className="cart-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-light)' }}>
                  <span style={{ fontSize: '3rem' }}>🛒</span>
                  <p style={{ marginTop: '1rem', fontWeight: 600 }}>Your tray is empty.</p>
                </div>
              ) : (
                <div>
                  {cart.map(item => (
                    <div key={item.product} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</h4>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>₹{item.price} each</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                          
                          {/* Qty Selector */}
                          <div className="qty-selector">
                            <button className="qty-btn" onClick={() => updateQty(item.product, item.qty - 1)}><FiMinus /></button>
                            <span className="qty-val">{item.qty}</span>
                            <button className="qty-btn" onClick={() => updateQty(item.product, item.qty + 1)}><FiPlus /></button>
                          </div>

                          <button style={{ color: 'var(--danger-color)' }} onClick={() => removeFromCart(item.product)}>
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>₹{item.price * item.qty}</span>
                    </div>
                  ))}

                  {/* Promo Coupons Section */}
                  <div style={{ marginTop: '1.5rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '1rem', background: 'rgba(140, 98, 57, 0.05)' }}>
                    <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>🎫 Use Discount Coupon</h5>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. AROMA10"
                        style={{ padding: '0.4rem 0.8rem', textTransform: 'uppercase' }}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', borderRadius: '8px' }} onClick={applyCoupon}>Apply</button>
                    </div>
                    {couponApplied && (
                      <span style={{ fontSize: '0.8rem', color: 'green', display: 'block', marginTop: '0.3rem' }}>
                        ✓ Coupon {couponApplied} Applied ({couponDiscount}% Discount)
                      </span>
                    )}
                  </div>

                  {/* Customer Information (Optional name/mobile, Mandatory Table) */}
                  <form onSubmit={handlePlaceOrder} style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Customer Details</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Customer Mobile (For loyalty points)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10-digit number"
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                        onBlur={handleMobileBlur}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Customer Name (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    {/* Loyalty Point Redeemer */}
                    {loyaltyPoints > 0 && (
                      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '1rem', border: '1px solid #c2ebcf', background: '#eefcf1', padding: '0.8rem', borderRadius: '8px', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>You have {loyaltyPoints} Loyalty Points!</span>
                          <span style={{ fontSize: '0.75rem', display: 'block', color: '#15803d' }}>Save ₹{loyaltyPoints} on this order</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={redeemPoints}
                          onChange={(e) => setRedeemPoints(e.target.checked)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Table Number (Required)</label>
                      <select
                        className="form-control"
                        required
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        disabled={isTableLocked}
                      >
                        <option value="">-- Select Table --</option>
                        {Array.from({ length: 30 }, (_, i) => `Table ${i + 1}`).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {isTableLocked && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', display: 'block', marginTop: '0.2rem' }}>
                          🔒 Preselected via QR Code scan
                        </span>
                      )}
                    </div>

                    {/* Billing Summary */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>₹{calcs.subtotal}</span>
                      </div>
                      {calcs.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
                          <span>Discount:</span>
                          <span>-₹{calcs.discount}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>GST (5%):</span>
                        <span>₹{calcs.gst}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Service Charge (2%):</span>
                        <span>₹{calcs.serviceCharge}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)', borderTop: '2px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <span>GRAND TOTAL:</span>
                        <span>₹{calcs.grandTotal}</span>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-accent btn-block" style={{ marginTop: '2rem' }}>
                      Place Order (₹{calcs.grandTotal})
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
