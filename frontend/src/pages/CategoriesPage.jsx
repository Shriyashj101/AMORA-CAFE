import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const categories = [
    { id: 1, name: 'Electronics & Tech', items: 120, icon: '💻', color: '#3b82f6' },
    { id: 2, name: 'Fashion & Apparel', items: 85, icon: '👕', color: '#ec4899' },
    { id: 3, name: 'Home & Kitchen', items: 210, icon: '🏠', color: '#10b981' },
    { id: 4, name: 'Sports & Outdoors', items: 45, icon: '⚽', color: '#f59e0b' },
    { id: 5, name: 'Beauty & Health', items: 156, icon: '💄', color: '#8b5cf6' },
    { id: 6, name: 'Books & Stationery', items: 320, icon: '📚', color: '#6366f1' },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Shop by Category</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Browse our wide selection of high-quality products across all departments.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {categories.map((category) => (
          <Link key={category.id} to={`/products?category=${category.name.toLowerCase()}`} style={{ display: 'block' }}>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '1rem',
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              transition: 'var(--transition)',
              cursor: 'pointer'
            }} className="category-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = category.color;
              e.currentTarget.style.boxShadow = `0 10px 15px -3px ${category.color}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                fontSize: '3rem', 
                background: `${category.color}22`,
                width: '80px',
                height: '80px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '1rem'
              }}>
                {category.icon}
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{category.name}</h3>
                <span style={{ color: 'var(--text-light)' }}>{category.items} Products Available</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
