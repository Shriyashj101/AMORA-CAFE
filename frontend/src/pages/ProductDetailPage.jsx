import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API Call
    const fetchProduct = () => {
      // Mock data match
      const mockProduct = {
        _id: id,
        name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        brand: 'Sony',
        price: 348.0,
        rating: 4.8,
        numReviews: 1243,
        description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo. Up to 30-hour battery life with quick charging (10 min charge for 5 hours of playback). Touch Sensor controls to pause/play/skip tracks, control volume, activate your voice assistant, and answer phone calls.',
        countInStock: 5,
      };
      setProduct(mockProduct);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    const existingCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const itemExists = existingCart.find(item => item._id === product._id);
    
    if (itemExists) {
      itemExists.qty += 1;
    } else {
      existingCart.push({ ...product, qty: 1 });
    }
    
    localStorage.setItem('cartItems', JSON.stringify(existingCart));
    alert(`${product.name} added to cart!`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Go Back
      </Link>
      
      <div className="product-detail-grid">
        <div className="detail-img-container">
          <img src={product.image} alt={product.name} className="detail-img" />
        </div>
        
        <div>
          <span className="product-brand" style={{ fontSize: '1rem' }}>{product.brand}</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <span style={{ color: '#fbbf24', marginRight: '0.5rem' }}>★★★★★</span>
            <strong>{product.rating}</strong>
            <span style={{ color: 'var(--text-light)', marginLeft: '0.5rem' }}>({product.numReviews} reviews)</span>
          </div>
          
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '1.5rem' }}>
            ${product.price ? product.price.toFixed(2) : '0.00'}
          </h2>
          
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.8' }}>
            {product.description}
          </p>

          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '1rem', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <span>Status:</span>
              <strong>{product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</strong>
            </div>
            
            <button 
              className="btn btn-primary btn-block" 
              disabled={product.countInStock === 0}
              style={{ fontSize: '1.25rem' }}
              onClick={addToCartHandler}
            >
              Add to Cart
            </button>
            <button className="btn btn-secondary btn-block" style={{ marginTop: '1rem' }}>
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
