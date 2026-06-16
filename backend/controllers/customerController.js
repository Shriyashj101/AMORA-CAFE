import Customer from '../models/Customer.js';

// @desc    Get customer loyalty points by mobile number
// @route   GET /api/customer/:mobile
// @access  Public
export const getCustomerByMobile = async (req, res) => {
  const { mobile } = req.params;

  try {
    const customer = await Customer.findOne({ mobileNumber: mobile });
    if (customer) {
      res.json(customer);
    } else {
      res.json({ name: '', mobileNumber: mobile, loyaltyPoints: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
