import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiLogOut, FiDollarSign, FiShoppingBag, FiClock, FiCheckSquare, 
  FiFileText, FiCoffee, FiUsers, FiCpu, FiTag, FiBox, 
  FiTrash2, FiPlus, FiEdit, FiSearch, FiCalendar, FiDownload, FiAlertTriangle
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || "https://amora-cafe-backend.onrender.com/api";

const AdminDashboard = () => {
  // Navigation tabs: 'dashboard' | 'orders' | 'menu' | 'employees' | 'inventory' | 'coupons' | 'reports' | 'insights'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [branch, setBranch] = useState('Main Branch');

  // Stats & Charts
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    gstCollected: 0,
    serviceChargesCollected: 0,
    popularFoodItems: []
  });
  const [chartData, setChartData] = useState({ dailyData: [], monthlyData: [] });
  const [aiInsights, setAiInsights] = useState({
    bestSellingItem: '',
    slowSellingItem: '',
    peakHours: '',
    revenueTrends: ''
  });

  // Orders Management & History
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderTimeframe, setOrderTimeframe] = useState('');

  // Menu CRUD
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '', price: '', category: 'Meals', description: '', image: '', isSpecial: false
  });

  // Employee Management
  const [employees, setEmployees] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    name: '', loginId: '', password: '', role: 'cook'
  });

  // Inventory Management
  const [inventory, setInventory] = useState([]);
  const [inventoryForm, setInventoryForm] = useState({
    name: '', stock: 0, unit: 'kg', minThreshold: 5
  });

  // Coupon Management
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: '', discountPercentage: 10
  });

  // Feedback/Reviews
  const [feedbacks, setFeedbacks] = useState([]);

  // Reports
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);

  const navigate = useNavigate();

  // Guard & Initializer
  useEffect(() => {
    const token = localStorage.getItem('aroma_token');
    const user = JSON.parse(localStorage.getItem('aroma_user') || '{}');
    if (!token || user.role !== 'admin') {
      localStorage.removeItem('aroma_token');
      localStorage.removeItem('aroma_user');
      navigate('/login');
      return;
    }
    
    // Initial page load data
    loadAllData();
  }, [navigate, tabWatcher(activeTab), branch]);

  // Small helper to fetch corresponding data when active tab changes
  function tabWatcher(tab) {
    return tab;
  }

  const loadAllData = async () => {
    const token = localStorage.getItem('aroma_token');
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const queryBranch = `?branch=${encodeURIComponent(branch)}`;

    try {
      if (activeTab === 'dashboard') {
        const resStats = await axios.get(`${API_URL}/analytics/dashboard${queryBranch}`, config);
        setStats(resStats.data);
        const resCharts = await axios.get(`${API_URL}/analytics/charts${queryBranch}`, config);
        setChartData(resCharts.data);
      } 
      else if (activeTab === 'orders') {
        let orderQuery = `?branch=${encodeURIComponent(branch)}`;
        if (orderTimeframe) orderQuery += `&timeframe=${orderTimeframe}`;
        const resOrders = await axios.get(`${API_URL}/orders${orderQuery}`, config);
        setOrders(resOrders.data);
      } 
      else if (activeTab === 'menu') {
        const resMenu = await axios.get(`${API_URL}/products?branch=${encodeURIComponent(branch)}`);
        setMenuItems(resMenu.data);
      } 
      else if (activeTab === 'employees') {
        const resEmp = await axios.get(`${API_URL}/auth/employees`, config);
        setEmployees(resEmp.data);
      } 
      else if (activeTab === 'inventory') {
        const resInv = await axios.get(`${API_URL}/inventory${queryBranch}`, config);
        setInventory(resInv.data);
      } 
      else if (activeTab === 'coupons') {
        const resCoup = await axios.get(`${API_URL}/coupons`, config);
        setCoupons(resCoup.data);
        const resFeedback = await axios.get(`${API_URL}/feedback`, config);
        setFeedbacks(resFeedback.data);
      } 
      else if (activeTab === 'insights') {
        const resInsights = await axios.get(`${API_URL}/analytics/insights${queryBranch}`, config);
        setAiInsights(resInsights.data);
      } 
      else if (activeTab === 'reports') {
        const resReport = await axios.get(`${API_URL}/analytics/report?type=${reportType}&branch=${encodeURIComponent(branch)}`, config);
        setReportData(resReport.data);
      }
    } catch (err) {
      console.error('Admin API fetch failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aroma_token');
    localStorage.removeItem('aroma_user');
    navigate('/login');
  };

  // 1. MENU CRUD ACTIONS
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = { ...menuForm, branch };

    try {
      if (editingItem) {
        await axios.put(`${API_URL}/products/${editingItem._id}`, payload, config);
        alert('Menu item updated!');
      } else {
        await axios.post(`${API_URL}/products`, payload, config);
        alert('Menu item created!');
      }
      setEditingItem(null);
      setMenuForm({ name: '', price: '', category: 'Meals', description: '', image: '', isSpecial: false });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleEditProduct = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      image: item.image,
      isSpecial: item.isSpecial
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API_URL}/products/${id}`, config);
      loadAllData();
    } catch (err) {
      alert('Error deleting menu item');
    }
  };

  // 2. EMPLOYEE MANAGEMENT ACTIONS
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.post(`${API_URL}/auth/register`, employeeForm, config);
      alert('Employee registered successfully!');
      setEmployeeForm({ name: '', loginId: '', password: '', role: 'cook' });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Remove this employee?')) return;
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API_URL}/auth/employees/${id}`, config);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing employee');
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = window.prompt('Enter new password for this employee:');
    if (!newPassword) return;
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(`${API_URL}/auth/employees/${id}/password`, { password: newPassword }, config);
      alert('Password updated successfully!');
    } catch (err) {
      alert('Error updating password');
    }
  };

  // 3. INVENTORY ACTIONS
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = { ...inventoryForm, branch };

    try {
      await axios.post(`${API_URL}/inventory`, payload, config);
      alert('Inventory item saved!');
      setInventoryForm({ name: '', stock: 0, unit: 'kg', minThreshold: 5 });
      loadAllData();
    } catch (err) {
      alert('Error saving inventory item');
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API_URL}/inventory/${id}`, config);
      loadAllData();
    } catch (err) {
      alert('Error deleting item');
    }
  };

  // 4. COUPON ACTIONS
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.post(`${API_URL}/coupons`, couponForm, config);
      alert('Coupon created!');
      setCouponForm({ code: '', discountPercentage: 10 });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API_URL}/coupons/${id}`, config);
      loadAllData();
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  // 5. UPDATE STATUS (ADMIN FORCE ACTION)
  const handleUpdateOrderStatus = async (id, status) => {
    const token = localStorage.getItem('aroma_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status }, config);
      loadAllData();
    } catch (err) {
      alert('Error updating order');
    }
  };

  // REPORTS & EXPORT ACTIONS
  const handleExportCSV = () => {
    if (!reportData || reportData.ordersList.length === 0) return;

    // Build CSV Content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Table Number,Grand Total,GST (5%),Service Charge (2%),Discount,Status,Date\n';

    reportData.ordersList.forEach(o => {
      csvContent += `${o.orderId},${o.tableNumber},${o.grandTotal},${o.gst},${o.serviceCharge},${o.discount},${o.status},${o.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aroma_report_${reportType}_${branch.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Search orders filter
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.tableNumber.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', minHeight: '80vh', flexDirection: 'row', flexWrap: 'wrap' }}>
      
      {/* Sidebar Navigation */}
      <div className="glass-card" style={{ flex: '1 1 250px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '220px', height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>👑</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginTop: '0.3rem' }}>Owner Control</h3>
          
          {/* Branch Switcher */}
          <select
            className="form-control"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '50px', marginTop: '0.8rem', background: 'rgba(140, 98, 57, 0.08)' }}
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="Main Branch">🏫 Main Branch</option>
            <option value="Downtown Branch">🌆 Downtown Branch</option>
          </select>
        </div>

        <button style={navBtnStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}><FiDollarSign /> Revenue Analytics</button>
        <button style={navBtnStyle(activeTab === 'orders')} onClick={() => setActiveTab('orders')}><FiShoppingBag /> Order Console</button>
        <button style={navBtnStyle(activeTab === 'menu')} onClick={() => setActiveTab('menu')}><FiCoffee /> Menu Manager</button>
        <button style={navBtnStyle(activeTab === 'employees')} onClick={() => setActiveTab('employees')}><FiUsers /> Employee roster</button>
        <button style={navBtnStyle(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}><FiBox /> Ingredient Stock</button>
        <button style={navBtnStyle(activeTab === 'coupons')} onClick={() => setActiveTab('coupons')}><FiTag /> Coupons & Reviews</button>
        <button style={navBtnStyle(activeTab === 'insights')} onClick={() => setActiveTab('insights')}><FiCpu /> AI Sales Insights</button>
        <button style={navBtnStyle(activeTab === 'reports')} onClick={() => setActiveTab('reports')}><FiFileText /> Export Reports</button>

        <button className="btn btn-secondary" style={{ marginTop: '2rem', padding: '0.6rem' }} onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Main Panel Content Area */}
      <div style={{ flex: '3 1 700px', minWidth: '320px' }}>
        
        {/* TAB 1: REVENUE ANALYTICS */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Financial Analytics - {branch}</h2>
            
            {/* Metric KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>TODAY'S REVENUE</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-color)', marginTop: '0.5rem' }}>₹{stats.todayRevenue}</p>
              </div>
              <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>ACTIVE/PENDING ORDERS</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.5rem' }}>{stats.pendingOrders}</p>
              </div>
              <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>COMPLETED ORDERS</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'green', marginTop: '0.5rem' }}>{stats.completedOrders}</p>
              </div>
              <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>TODAY'S TAX (GST)</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.5rem' }}>₹{stats.gstCollected}</p>
              </div>
            </div>

            {/* Custom Bar Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              
              {/* Daily Chart */}
              <div className="glass-card">
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📅 Daily Revenue Trend (Last 7 Days)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '1rem', borderBottom: '2px solid var(--border-color)' }}>
                  {chartData.dailyData.map((day, idx) => {
                    const maxRevenue = Math.max(...chartData.dailyData.map(d => d.revenue), 100);
                    const heightPercent = `${(day.revenue / maxRevenue) * 90}%`;
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 'auto' }}>₹{day.revenue}</div>
                        <div style={{
                          width: '70%',
                          height: heightPercent,
                          background: 'var(--primary-color)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease',
                          minHeight: day.revenue > 0 ? '10px' : '0px'
                        }}></div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '0.4rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {day.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Chart */}
              <div className="glass-card">
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📈 Monthly Revenue Trend (Last 6 Months)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '1rem', borderBottom: '2px solid var(--border-color)' }}>
                  {chartData.monthlyData.map((month, idx) => {
                    const maxRevenue = Math.max(...chartData.monthlyData.map(m => m.revenue), 100);
                    const heightPercent = `${(month.revenue / maxRevenue) * 90}%`;
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 'auto' }}>₹{month.revenue}</div>
                        <div style={{
                          width: '60%',
                          height: heightPercent,
                          background: 'var(--accent-color)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease',
                          minHeight: month.revenue > 0 ? '10px' : '0px'
                        }}></div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>
                          {month.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Popular items listings */}
            <div className="glass-card">
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'var(--primary-color)' }}>🔥 Popular Menu Items Sales</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {stats.popularFoodItems.map((item, idx) => {
                  const maxPopularity = Math.max(...stats.popularFoodItems.map(p => p.popularity), 1);
                  const widthPercent = `${(item.popularity / maxPopularity) * 100}%`;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                        <span>{item.name} ({item.category})</span>
                        <span>{item.popularity} times ordered</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: widthPercent, height: '100%', background: 'var(--accent-color)', borderRadius: '10px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDER CONSOLE */}
        {activeTab === 'orders' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>Order Console</h2>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search order ID or table..."
                  style={{ width: '220px', borderRadius: '50px', padding: '0.4rem 1rem' }}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '140px', borderRadius: '50px', padding: '0.4rem 1rem' }}
                  value={orderTimeframe}
                  onChange={(e) => setOrderTimeframe(e.target.value)}
                >
                  <option value="">All History</option>
                  <option value="today">Today Only</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* List orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredOrders.map(order => (
                <div key={order._id} className="glass-card" style={{ padding: '1.2rem', background: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-color)' }}>{order.orderId}</span>
                      <span style={{ marginLeft: '1rem', background: 'var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {order.tableNumber}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        🕒 {new Date(order.createdAt).toLocaleTimeString('en-IN')} | {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>ITEMS ORDERED:</p>
                      <p style={{ fontWeight: 600 }}>
                        {order.orderItems.map(i => `${i.name} x ${i.qty}`).join(', ')}
                      </p>
                      {order.customerMobile && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                          Customer: {order.customerName || 'None'} ({order.customerMobile}) | Points awarded: {order.pointsEarned}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Bill amount:</p>
                      <p style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.1rem' }}>₹{order.grandTotal}</p>
                      
                      {/* Action status toggle */}
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        {order.status !== 'Served' ? (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}
                            onClick={() => handleUpdateOrderStatus(order._id, 'Served')}
                          >
                            Mark Served
                          </button>
                        ) : (
                          <span style={{ color: 'green', fontSize: '0.8rem', fontWeight: 700 }}>✓ Served</span>
                        )}
                        <select
                          value={order.status}
                          style={{ padding: '0.2rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        >
                          <option value="Received">Received</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Served">Served</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', margin: '4rem 0' }}>No orders found for the active criteria.</p>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MENU MANAGER */}
        {activeTab === 'menu' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Menu Catalog Manager - {branch}</h2>
            
            {/* Create / Edit Form */}
            <form onSubmit={handleSaveProduct} className="glass-card" style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.2rem', color: 'var(--primary-color)' }}>
                {editingItem ? '✏️ Modify Menu Item' : '➕ Add New Menu Item'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                <div className="form-group">
                  <label className="form-label">Food Item Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                  >
                    <option value="Meals">Meals</option>
                    <option value="Coffees">Coffees</option>
                    <option value="Cold Drinks">Cold Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Healthy Items">Healthy Items</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={menuForm.image}
                    onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  />
                </div>

              </div>

              <div className="form-group" style={{ marginTop: '0.8rem' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="isSpecial"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={menuForm.isSpecial}
                    onChange={(e) => setMenuForm({ ...menuForm, isSpecial: e.target.checked })}
                  />
                  <label htmlFor="isSpecial" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Chef's Special Tag</label>
                </div>
                
                <button type="submit" className="btn btn-accent" style={{ marginLeft: 'auto', padding: '0.5rem 1.5rem' }}>
                  {editingItem ? 'Save Updates' : 'Add Item'}
                </button>
                {editingItem && (
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem' }} onClick={() => {
                    setEditingItem(null);
                    setMenuForm({ name: '', price: '', category: 'Meals', description: '', image: '', isSpecial: false });
                  }}>Cancel</button>
                )}
              </div>
            </form>

            {/* Menu Table list */}
            <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'rgba(140, 98, 57, 0.08)' }}>
                    <th style={{ padding: '1rem' }}>Image</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Price</th>
                    <th style={{ padding: '1rem' }}>Today's Special</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{item.category}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>₹{item.price}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: item.isSpecial ? 'var(--accent-color)' : 'inherit' }}>
                        {item.isSpecial ? '★ Yes' : 'No'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button style={{ color: 'var(--primary-color)' }} onClick={() => handleEditProduct(item)}><FiEdit size={18} /></button>
                          <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDeleteProduct(item._id)}><FiTrash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 4: EMPLOYEE ROSTER */}
        {activeTab === 'employees' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Employee Management</h2>
            
            {/* Create cook credentials */}
            <form onSubmit={handleAddEmployee} className="glass-card" style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.2rem', color: 'var(--primary-color)' }}>🔑 Register New Staff Member</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. John Doe"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Login/Cook ID</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. cook2"
                    value={employeeForm.loginId}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, loginId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="••••••••"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control"
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                  >
                    <option value="cook">Cook / Chef</option>
                    <option value="admin">Admin / Owner</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ marginTop: '1rem', display: 'flex', marginLeft: 'auto' }}>
                Register Employee <FiPlus />
              </button>
            </form>

            {/* List Employees roster */}
            <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'rgba(140, 98, 57, 0.08)' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Login ID</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{emp.loginId}</td>
                      <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800 }}>
                        <span style={{ color: emp.role === 'admin' ? 'var(--accent-color)' : 'var(--primary-color)' }}>
                          {emp.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }} onClick={() => handleResetPassword(emp._id)}>Reset PW</button>
                          <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDeleteEmployee(emp._id)}><FiTrash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 5: INGREDIENT STOCK */}
        {activeTab === 'inventory' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Ingredient Inventory - {branch}</h2>
            
            {/* Low stock visual alert banner */}
            {inventory.some(i => i.stock < i.minThreshold) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#fef2f2', border: '2px solid #fca5a5', color: '#991b1b', padding: '1rem 1.5rem', borderRadius: '1.2rem', marginBottom: '2rem' }}>
                <FiAlertTriangle size={24} />
                <div>
                  <span style={{ fontWeight: 800 }}>INVENTORY WARNING:</span> Low stock detected on ingredients: {inventory.filter(i => i.stock < i.minThreshold).map(i => i.name).join(', ')}. Please restock.
                </div>
              </div>
            )}

            {/* Quick Stock insertion */}
            <form onSubmit={handleSaveInventory} className="glass-card" style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.2rem', color: 'var(--primary-color)' }}>📦 Create Ingredient Ledger</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                <div className="form-group">
                  <label className="form-label">Ingredient Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Milk"
                    value={inventoryForm.name}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={inventoryForm.stock}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, stock: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit of Measure</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. kg / liters / units"
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Threshold Level</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={inventoryForm.minThreshold}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, minThreshold: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ marginTop: '1rem', display: 'flex', marginLeft: 'auto' }}>
                Add Ingredient Stock <FiPlus />
              </button>
            </form>

            {/* Ledger listings */}
            <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'rgba(140, 98, 57, 0.08)' }}>
                    <th style={{ padding: '1rem' }}>Ingredient</th>
                    <th style={{ padding: '1rem' }}>Stock Level</th>
                    <th style={{ padding: '1rem' }}>Min Threshold</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => {
                    const isLow = item.stock < item.minThreshold;
                    return (
                      <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)', background: isLow ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{item.stock} {item.unit}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{item.minThreshold} {item.unit}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {isLow ? (
                            <span style={{ color: 'var(--danger-color)', fontWeight: 800, fontSize: '0.8rem' }}>⚠️ LOW STOCK</span>
                          ) : (
                            <span style={{ color: 'green', fontWeight: 800, fontSize: '0.8rem' }}>✓ healthy</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDeleteInventory(item._id)}><FiTrash2 size={18} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 6: COUPONS & REVIEWS */}
        {activeTab === 'coupons' && (
          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Coupons manager */}
            <div className="glass-card">
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Discount Coupons</h2>
              <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ textTransform: 'uppercase' }}
                    required
                    placeholder="e.g. AROMA15"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                  <label className="form-label">Discount Percentage (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    max="100"
                    value={couponForm.discountPercentage}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: parseInt(e.target.value) })}
                  />
                </div>
                <button type="submit" className="btn btn-accent" style={{ padding: '0.75rem 1.5rem' }}>Create Coupon</button>
              </form>

              {/* Coupon list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {coupons.map(coup => (
                  <div key={coup._id} style={{ border: '2px dashed var(--border-color)', padding: '1rem', borderRadius: '12px', background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-color)' }}>{coup.code}</span>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)' }}>{coup.discountPercentage}% off discount</span>
                    </div>
                    <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDeleteCoupon(coup._id)}><FiTrash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Feedbacks/Reviews */}
            <div className="glass-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Customer Ratings & Feedback</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbacks.map(fb => (
                  <div key={fb._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order ID: {fb.orderId}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>🕒 {new Date(fb.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < fb.rating ? 'orange' : '#ccc' }}>★</span>
                      ))}
                    </div>

                    <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      "{fb.review || 'No written comment'}"
                    </p>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No ratings submitted yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: AI SALES INSIGHTS */}
        {activeTab === 'insights' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>✨ AI Cafe Insights - {branch}</h2>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(245, 158, 11, 0.05) 100%)' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-color)' }}>POPULAR DEMAND</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '0.2rem' }}>🥇 Best Selling Menu Item</h4>
                <p style={{ fontSize: '0.95rem', marginTop: '0.3rem' }}>{aiInsights.bestSellingItem}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-light)' }}>INVENTORY DEMAND ADJUSTMENTS</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '0.2rem' }}>🐢 Slowest Selling Menu Item</h4>
                <p style={{ fontSize: '0.95rem', marginTop: '0.3rem' }}>{aiInsights.slowSellingItem}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6' }}>PEAK VISITOR HOURS</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '0.2rem' }}>🕒 Cafe Rush Peak Hours</h4>
                <p style={{ fontSize: '0.95rem', marginTop: '0.3rem' }}>{aiInsights.peakHours}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'green' }}>TRENDS SUMMARY</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '0.2rem' }}>📈 AI Business Trend Statement</h4>
                <p style={{ fontSize: '0.95rem', marginTop: '0.3rem', lineHeight: 1.4 }}>{aiInsights.revenueTrends}</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: EXPORT REPORTS */}
        {activeTab === 'reports' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Export Reports</h2>
            
            {/* Filter report scope */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                  <label className="form-label">Report Period Scope</label>
                  <select
                    className="form-control"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="daily">Daily Report (Today)</option>
                    <option value="weekly">Weekly Report (Last 7 Days)</option>
                    <option value="monthly">Monthly Report (Last 30 Days)</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-accent" onClick={handleExportCSV} disabled={!reportData}>
                    <FiDownload /> Export CSV Sheet
                  </button>
                  <button className="btn btn-primary" onClick={handlePrintPDF}>
                    <FiFileText /> Print/PDF Report
                  </button>
                </div>
              </div>
            </div>

            {/* Report view display (Printable) */}
            {reportData && (
              <div className="glass-card" id="printable-report" style={{ background: 'var(--card-bg)', border: '2px solid var(--primary-color)', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', textTransform: 'uppercase' }}>Aroma Cafe Operations Ledger</h2>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    Branch: {branch} | Scope Period: {reportType}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    Generated on: {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>

                {/* Summaries */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>TOTAL TURNOVER</span>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>₹{reportData.totalSales}</h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>GST COLLECTED (5%)</span>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>₹{reportData.totalGst}</h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>ORDER VOLUME</span>
                    <h3 style={{ fontSize: '1.5rem' }}>{reportData.orderCount} sales</h3>
                  </div>
                </div>

                {/* Report Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '0.5rem 0' }}>Order ID</th>
                      <th style={{ padding: '0.5rem 0' }}>Table</th>
                      <th style={{ padding: '0.5rem 0' }}>GST</th>
                      <th style={{ padding: '0.5rem 0' }}>S.Charge</th>
                      <th style={{ padding: '0.5rem 0' }}>Discount</th>
                      <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.ordersList.map((o, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #ebdccb' }}>
                        <td style={{ padding: '0.5rem 0' }}>{o.orderId}</td>
                        <td style={{ padding: '0.5rem 0' }}>{o.tableNumber}</td>
                        <td style={{ padding: '0.5rem 0' }}>₹{o.gst}</td>
                        <td style={{ padding: '0.5rem 0' }}>₹{o.serviceCharge}</td>
                        <td style={{ padding: '0.5rem 0' }}>₹{o.discount}</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 700 }}>₹{o.grandTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

// Styling helper
const navBtnStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.9rem',
  width: '100%',
  color: isActive ? 'var(--bg-color)' : 'var(--text-main)',
  background: isActive ? 'var(--primary-color)' : 'transparent',
  boxShadow: isActive ? '0 4px 10px rgba(78, 54, 41, 0.25)' : 'none',
  textAlign: 'left'
});

export default AdminDashboard;
