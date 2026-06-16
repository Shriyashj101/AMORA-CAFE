import mongoose from '../utils/mockMongoose.js';

const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'units',
    },
    minThreshold: {
      type: Number,
      required: true,
      default: 10,
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

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
