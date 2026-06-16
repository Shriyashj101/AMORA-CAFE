import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  const { items } = req.body;

  try {
    // Determine total amount from items (Mock logic)
    const totalAmount = items ? items.reduce((acc, item) => acc + item.price * item.qty, 0) : 500;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe requires amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.route('/create-intent').post(createPaymentIntent);

export default router;
