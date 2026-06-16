import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountPercentage } = req.body;

  try {
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'Coupon already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountPercentage,
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon
// @route   GET /api/coupons/validate/:code
// @access  Public
export const validateCoupon = async (req, res) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (coupon) {
      res.json({
        valid: true,
        discountPercentage: coupon.discountPercentage,
        code: coupon.code,
      });
    } else {
      res.json({ valid: false, message: 'Invalid or expired coupon code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
