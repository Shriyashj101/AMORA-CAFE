import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Coupon from '../models/Coupon.js';

// Helper to generate unique order ID: ORD-YYYY-XXXXX
const generateOrderId = async () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
  const newOrderId = `ORD-${year}-${random}`;
  
  // Check if exists
  const exists = await Order.findOne({ orderId: newOrderId });
  if (exists) {
    return generateOrderId(); // Recurse
  }
  return newOrderId;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    tableNumber,
    customerName,
    customerMobile,
    couponCode,
    redeemPoints,
    branch,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }
  if (!tableNumber) {
    return res.status(400).json({ message: 'Table number is required' });
  }

  try {
    // Generate order ID
    const orderId = await generateOrderId();

    // Calculate subtotal
    let subtotal = 0;
    for (const item of orderItems) {
      subtotal += item.price * item.qty;
    }

    // Apply Coupon if exists
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        discount = (subtotal * coupon.discountPercentage) / 100;
      }
    }

    // Loyalty Points Logic
    let loyaltyDiscount = 0;
    let customer = null;
    if (customerMobile) {
      customer = await Customer.findOne({ mobileNumber: customerMobile });
      if (!customer) {
        customer = await Customer.create({
          name: customerName || 'Valued Customer',
          mobileNumber: customerMobile,
          loyaltyPoints: 0
        });
      }

      // Redeem points (1 point = ₹1 discount)
      if (redeemPoints && customer.loyaltyPoints > 0) {
        const redeemable = Math.min(customer.loyaltyPoints, subtotal - discount);
        loyaltyDiscount = redeemable;
        customer.loyaltyPoints -= redeemable;
        discount += loyaltyDiscount; // Add to total discount
      }
    }

    // Calculate Taxes
    const gstRate = 0.05; // 5%
    const serviceRate = 0.02; // 2%
    
    const taxableAmount = Math.max(0, subtotal - discount);
    const gst = parseFloat((taxableAmount * gstRate).toFixed(2));
    const serviceCharge = parseFloat((taxableAmount * serviceRate).toFixed(2));
    const grandTotal = parseFloat((taxableAmount + gst + serviceCharge).toFixed(2));

    // Award loyalty points (1 point per ₹10 of grandTotal)
    let pointsEarned = 0;
    if (customerMobile && customer) {
      pointsEarned = Math.floor(grandTotal / 10);
      customer.loyaltyPoints += pointsEarned;
      if (customerName && customerName !== customer.name) {
        customer.name = customerName;
      }
      await customer.save();
    }

    // Create Order
    const order = new Order({
      orderId,
      tableNumber,
      orderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst,
      serviceCharge,
      discount: parseFloat(discount.toFixed(2)),
      grandTotal,
      customerName: customerName || '',
      customerMobile: customerMobile || '',
      couponCode: couponCode || '',
      pointsEarned,
      branch: branch || 'Main Branch',
      status: 'Received',
    });

    const createdOrder = await order.save();

    // Increment popularity for products ordered
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { popularity: item.qty }
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID or orderId
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    // Look up by Mongo ObjectId or orderId string
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('orderItems.product');
    } else {
      order = await Order.findOne({ orderId: id }).populate('orderItems.product');
    }

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!['Received', 'Preparing', 'Ready', 'Served'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (with filters for Admin/Cook portals)
// @route   GET /api/orders
// @access  Private/Staff
export const getOrders = async (req, res) => {
  const { status, branch, tableNumber, orderId, timeframe } = req.query;

  try {
    let query = {};

    if (status) {
      query.status = status;
    }
    if (branch) {
      query.branch = branch;
    }
    if (tableNumber) {
      query.tableNumber = tableNumber;
    }
    if (orderId) {
      query.orderId = { $regex: orderId, $options: 'i' };
    }

    // Handle timeframe filters
    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      query.createdAt = { $gte: startDate, $lte: now };
    }

    // Admin dashboard: sorted by newest. Cook Dashboard: active orders sorted by oldest first.
    let sort = { createdAt: -1 };
    if (status && status !== 'Served') {
      sort = { createdAt: 1 }; // FIFO for kitchen processing
    }

    const orders = await Order.find(query).sort(sort);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
