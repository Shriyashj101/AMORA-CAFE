import mongoose from '../utils/mockMongoose.js';

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null/empty values and indexes uniquely only for non-null values
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
