import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Mock Product Catalog for testing without API
    setProducts([
      {
        _id: '1',
        name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80',
        brand: 'Sony',
        price: 348.0,
        rating: 4.8,
        numReviews: 1243
      },
      {
        _id: '2',
        name: 'Apple iPhone 15 Pro Max - Titanium',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80',
        brand: 'Apple',
        price: 1199.0,
        rating: 4.9,
        numReviews: 3201
      },
      // ... Add more mock items 
      {
        _id: '5',
        name: 'Logitech MX Master 3S Wireless Mouse',
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80',
        brand: 'Logitech',
        price: 99.99,
        rating: 4.8,
        numReviews: 2500
      }
    ]);
  }, []);

  const addToCartHandler = (product) => {
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>All Products</h1>
        <div>
          <select className="form-control" style={{ width: 'auto' }}>
            <option>Sort By: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>
      
      <div className="product-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <Link to={`/product/${product._id}`}>
              <img src={product.image} alt={product.name} className="product-img" />
            </Link>
            <div className="product-info">
              <span className="product-brand">{product.brand}</span>
              <Link to={`/product/${product._id}`}>
                <h3 className="product-name">{product.name}</h3>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.25rem', marginRight: '0.5rem' }}>★</span>
                <strong>{product.rating}</strong>
                <span style={{ color: 'var(--text-light)', marginLeft: '0.5rem' }}>({product.numReviews} reviews)</span>
              </div>
              <div className="product-footer">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <button className="btn btn-secondary" onClick={() => addToCartHandler(product)}>Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
