import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from './utils/mockMongoose.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Models for seeding
import User from './models/User.js';
import Product from './models/Product.js';
import Inventory from './models/Inventory.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Seed function
const seedDatabase = async () => {
  try {
    // 1. Seed Users (Admin & Cook)
    const adminExists = await User.findOne({ loginId: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Cafe Owner',
        loginId: 'admin',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Seeded Admin User: admin / admin123');
    }

    const cookExists = await User.findOne({ loginId: 'cook1' });
    if (!cookExists) {
      await User.create({
        name: 'Head Chef',
        loginId: 'cook1',
        password: 'cook123',
        role: 'cook',
      });
      console.log('Seeded Cook User: cook1 / cook123');
    }

    // 2. Seed Menu Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const items = [
        // Meals
        { name: 'Veg Burger', category: 'Meals', price: 120, description: 'Delicious vegetable patty with fresh lettuce, tomato, and signature burger sauce.', isSpecial: false, popularity: 15 },
        { name: 'Cheese Burger', category: 'Meals', price: 150, description: 'Juicy patty loaded with double melted cheese, pickles, and grilled onions.', isSpecial: true, popularity: 25 },
        { name: 'Sandwich', category: 'Meals', price: 90, description: 'Toasted club sandwich packed with sliced cucumber, tomatoes, spinach, and cheese.', isSpecial: false, popularity: 8 },
        { name: 'Pasta', category: 'Meals', price: 180, description: 'Creamy white sauce penne pasta tossed with bell peppers and garlic herbs.', isSpecial: true, popularity: 19 },
        { name: 'Pizza', category: 'Meals', price: 240, description: '8-inch thin crust garden fresh pizza with olives, capsicum, and premium mozzarella.', isSpecial: false, popularity: 12 },
        // Coffees
        { name: 'Espresso', category: 'Coffees', price: 80, description: 'Intense, concentrated shot of pure dark roasted premium Arabica beans.', isSpecial: false, popularity: 40 },
        { name: 'Cappuccino', category: 'Coffees', price: 110, description: 'Balanced espresso shot topped with equal parts steamed milk and creamy foam.', isSpecial: false, popularity: 60 },
        { name: 'Latte', category: 'Coffees', price: 120, description: 'Smooth, milky espresso drink made with steamed milk and a light layer of foam.', isSpecial: true, popularity: 75 },
        { name: 'Mocha', category: 'Coffees', price: 130, description: 'Rich espresso blended with dark hot chocolate syrup and steamed milk foam.', isSpecial: false, popularity: 32 },
        { name: 'Americano', category: 'Coffees', price: 90, description: 'Espresso shots diluted with filtered hot water for a smooth black coffee experience.', isSpecial: false, popularity: 18 },
        // Cold Drinks
        { name: 'Coke Can', category: 'Cold Drinks', price: 40, description: 'Chilled 300ml Coca-Cola can.', isSpecial: false, popularity: 50 },
        { name: 'Sprite Can', category: 'Cold Drinks', price: 40, description: 'Chilled 300ml Sprite can.', isSpecial: false, popularity: 30 },
        { name: 'Cold Coffee', category: 'Cold Drinks', price: 120, description: 'Blended espresso, chilled milk, and vanilla ice cream topped with chocolate powder.', isSpecial: true, popularity: 95 },
        { name: 'Lemon Soda', category: 'Cold Drinks', price: 70, description: 'Thirst-quenching sweet and salty fizzy lemon juice topped with fresh mint.', isSpecial: false, popularity: 22 },
        // Snacks
        { name: 'French Fries', category: 'Snacks', price: 80, description: 'Crispy, deep-fried golden potato strips lightly seasoned with sea salt.', isSpecial: false, popularity: 45 },
        { name: 'Garlic Bread', category: 'Snacks', price: 100, description: 'Four slices of toasted baguette brushed with garlic butter and parsley.', isSpecial: false, popularity: 15 },
        { name: 'Spring Rolls', category: 'Snacks', price: 110, description: 'Crispy fried sheets filled with julienne vegetables, served with sweet chilli sauce.', isSpecial: false, popularity: 20 },
        // Desserts
        { name: 'Fudge Brownie', category: 'Desserts', price: 110, description: 'Warm, gooey chocolate fudge brownie drizzled with hot chocolate syrup.', isSpecial: true, popularity: 55 },
        { name: 'Cheesecake', category: 'Desserts', price: 160, description: 'Classic New York style baked cheesecake with a sweet blueberry glaze overlay.', isSpecial: false, popularity: 38 },
        // Healthy Items
        { name: 'Fruit Salad Bowl', category: 'Healthy Items', price: 130, description: 'A refreshing bowl of sliced seasonal fruits (apple, papaya, banana, grapes).', isSpecial: false, popularity: 10 },
        { name: 'Berry Smoothie', category: 'Healthy Items', price: 140, description: 'Antioxidant rich blend of blueberries, strawberries, yogurt, and honey.', isSpecial: true, popularity: 28 },
      ];
      await Product.insertMany(items);
      console.log('Seeded Menu Items successfully!');
    }

    // 3. Seed Inventory if empty
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      const stockItems = [
        { name: 'Coffee Beans', stock: 15, unit: 'kg', minThreshold: 3 },
        { name: 'Milk', stock: 8, unit: 'liters', minThreshold: 10 }, // Triggers alert (stock < threshold)
        { name: 'Sugar', stock: 12, unit: 'kg', minThreshold: 2 },
        { name: 'Cold Drinks', stock: 45, unit: 'units', minThreshold: 10 },
        { name: 'Bread', stock: 3, unit: 'packs', minThreshold: 5 }, // Triggers alert (stock < threshold)
        { name: 'Vegetables', stock: 20, unit: 'kg', minThreshold: 5 },
      ];
      await Inventory.insertMany(stockItems);
      console.log('Seeded Inventory successfully!');
    }

    // 4. Seed Coupons if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const coupons = [
        { code: 'AROMA10', discountPercentage: 10 },
        { code: 'AROMA20', discountPercentage: 20 },
        { code: 'WELCOME30', discountPercentage: 30 },
      ];
      await Coupon.insertMany(coupons);
      console.log('Seeded Coupons successfully!');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
    console.log('MongoDB Connected to Primary URI');
    await seedDatabase();
  } catch (err) {
    console.log('Primary MongoDB Connection Error:', err.message);
    console.log('Trying local fallback (mongodb://127.0.0.1:27017/ecommerce)...');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
      console.log('MongoDB Connected to Local Fallback');
      await seedDatabase();
    } catch (localErr) {
      console.log('Local MongoDB Fallback Connection Error:', localErr.message);
    }
  }
};
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Aroma Cafe API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
