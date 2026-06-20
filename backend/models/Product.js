import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      default: '/images/sample.jpg',
    },
    category: {
      type: String,
      required: true,
      enum: ['Meals', 'Coffees', 'Cold Drinks', 'Snacks', 'Desserts', 'Healthy Items'],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isSpecial: {
      type: Boolean,
      required: true,
      default: false,
    },
    popularity: {
      type: Number,
      required: true,
      default: 0, // Incremented whenever the item is ordered
    },
    branch: {
      type: String,
      required: true,
      default: 'Main Branch',
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
