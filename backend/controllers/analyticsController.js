import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Get dashboard KPIs
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  const { branch } = req.query;

  try {
    let query = {};
    if (branch) {
      query.branch = branch;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const allOrders = await Order.find(query);
    const todayOrders = await Order.find({
      ...query,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    // Calculations
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.grandTotal, 0);
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => ['Received', 'Preparing', 'Ready'].includes(o.status)).length;
    const completedOrders = allOrders.filter(o => o.status === 'Served').length;
    
    const gstCollected = todayOrders.reduce((sum, order) => sum + order.gst, 0);
    const serviceChargesCollected = todayOrders.reduce((sum, order) => sum + order.serviceCharge, 0);

    // Popular Items
    const popularFoodItems = await Product.find(branch ? { branch } : {})
      .sort({ popularity: -1 })
      .limit(5);

    res.json({
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      totalOrders,
      pendingOrders,
      completedOrders,
      gstCollected: parseFloat(gstCollected.toFixed(2)),
      serviceChargesCollected: parseFloat(serviceChargesCollected.toFixed(2)),
      popularFoodItems: popularFoodItems.map(p => ({
        name: p.name,
        popularity: p.popularity,
        category: p.category,
        price: p.price
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chart data (daily and monthly)
// @route   GET /api/analytics/charts
// @access  Private/Admin
export const getChartData = async (req, res) => {
  const { branch } = req.query;

  try {
    let query = {};
    if (branch) {
      query.branch = branch;
    }

    // Last 7 Days Daily Revenue
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const dayOrders = await Order.find({
        ...query,
        createdAt: { $gte: start, $lte: end }
      });
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.grandTotal, 0);

      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      dailyData.push({
        label,
        revenue: parseFloat(dayRevenue.toFixed(2)),
        orders: dayOrders.length
      });
    }

    // Last 6 Months Monthly Revenue
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const monthOrders = await Order.find({
        ...query,
        createdAt: { $gte: start, $lte: end }
      });
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.grandTotal, 0);

      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlyData.push({
        label,
        revenue: parseFloat(monthRevenue.toFixed(2)),
        orders: monthOrders.length
      });
    }

    res.json({ dailyData, monthlyData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI-driven Sales Insights
// @route   GET /api/analytics/insights
// @access  Private/Admin
export const getAIInsights = async (req, res) => {
  const { branch } = req.query;

  try {
    let query = {};
    if (branch) {
      query.branch = branch;
    }

    // 1. Best Selling and Slow Selling Items
    const products = await Product.find(branch ? { branch } : {}).sort({ popularity: -1 });
    const bestSelling = products.length > 0 ? products[0] : { name: 'None yet', popularity: 0 };
    const slowSelling = products.length > 1 ? products[products.length - 1] : { name: 'None yet', popularity: 0 };

    // 2. Peak Hours Analysis
    const allOrders = await Order.find(query);
    const hourCounts = Array(24).fill(0);
    allOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour]++;
    });

    let peakHour = 12; // default noon
    let maxOrders = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxOrders) {
        maxOrders = count;
        peakHour = hour;
      }
    });

    const formatHour = (h) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:00 ${ampm}`;
    };

    const peakHoursString = maxOrders > 0
      ? `${formatHour(peakHour)} - ${formatHour((peakHour + 2) % 24)}`
      : '12:00 PM - 2:00 PM (Lunch Hour)';

    // 3. Revenue trends text
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const todayOrders = await Order.find({ ...query, createdAt: { $gte: todayStart } });
    const yesterdayOrders = await Order.find({ ...query, createdAt: { $gte: yesterdayStart, $lt: todayStart } });
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.grandTotal, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.grandTotal, 0);

    let trendDescription = 'Revenue remains stable compared to yesterday.';
    if (yesterdayRevenue > 0) {
      const diffPercent = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
      if (diffPercent > 5) {
        trendDescription = `Revenue is trending UP by ${diffPercent.toFixed(1)}% compared to yesterday. High demand in ${bestSelling.name}.`;
      } else if (diffPercent < -5) {
        trendDescription = `Revenue is trending DOWN by ${Math.abs(diffPercent).toFixed(1)}% compared to yesterday. Suggest offering coupons to boost engagement.`;
      }
    }

    res.json({
      bestSellingItem: `${bestSelling.name} (${bestSelling.popularity} ordered)`,
      slowSellingItem: `${slowSelling.name} (${slowSelling.popularity} ordered)`,
      peakHours: peakHoursString,
      revenueTrends: trendDescription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate report summaries (Daily, Weekly, Monthly sales, GST)
// @route   GET /api/analytics/report
// @access  Private/Admin
export const getSalesReports = async (req, res) => {
  const { type, branch } = req.query; // 'daily' | 'weekly' | 'monthly'

  try {
    let query = {};
    if (branch) {
      query.branch = branch;
    }

    const now = new Date();
    let startDate = new Date();

    if (type === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (type === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      // Default to daily/today
      startDate.setHours(0, 0, 0, 0);
    }

    query.createdAt = { $gte: startDate, $lte: now };

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const report = {
      totalSales: parseFloat(orders.reduce((sum, o) => sum + o.grandTotal, 0).toFixed(2)),
      totalSubtotal: parseFloat(orders.reduce((sum, o) => sum + o.subtotal, 0).toFixed(2)),
      totalGst: parseFloat(orders.reduce((sum, o) => sum + o.gst, 0).toFixed(2)),
      totalServiceCharge: parseFloat(orders.reduce((sum, o) => sum + o.serviceCharge, 0).toFixed(2)),
      totalDiscount: parseFloat(orders.reduce((sum, o) => sum + o.discount, 0).toFixed(2)),
      orderCount: orders.length,
      ordersList: orders.map(o => ({
        orderId: o.orderId,
        tableNumber: o.tableNumber,
        grandTotal: o.grandTotal,
        gst: o.gst,
        serviceCharge: o.serviceCharge,
        discount: o.discount,
        status: o.status,
        date: o.createdAt.toLocaleDateString('en-IN')
      }))
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
