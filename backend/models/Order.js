import mongoose from '../utils/mockMongoose.js';

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    tableNumber: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    gst: {
      type: Number,
      required: true,
      default: 0.0, // 5% GST
    },
    serviceCharge: {
      type: Number,
      required: true,
      default: 0.0, // 2% Service Charge
    },
    discount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      enum: ['Received', 'Preparing', 'Ready', 'Served'],
      default: 'Received',
    },
    customerName: {
      type: String,
      default: '',
    },
    customerMobile: {
      type: String,
      default: '',
    },
    couponCode: {
      type: String,
      default: '',
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    branch: {
      type: String,
      required: true,
      default: 'Main Branch',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
