import Feedback from '../models/Feedback.js';

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Public
export const submitFeedback = async (req, res) => {
  const { orderId, rating, review } = req.body;

  if (!orderId || !rating) {
    return res.status(400).json({ message: 'Order ID and rating are required' });
  }

  try {
    const feedback = new Feedback({
      orderId,
      rating,
      review: review || '',
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ date: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
