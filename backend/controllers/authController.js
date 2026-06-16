import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { loginId, password } = req.body;

  try {
    const user = await User.findOne({ loginId });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid Login ID or Password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new employee/user
// @route   POST /api/auth/register
// @access  Private/Admin
export const registerUser = async (req, res) => {
  const { name, loginId, password, role } = req.body;

  try {
    const userExists = await User.findOne({ loginId });

    if (userExists) {
      res.status(400).json({ message: 'Employee with this ID already exists' });
      return;
    }

    const user = await User.create({
      name,
      loginId,
      password,
      role: role || 'cook',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid employee data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/auth/employees
// @access  Private/Admin
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({}).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/auth/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Prevent deleting self
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400).json({ message: 'Cannot delete logged in admin account' });
        return;
      }
      await user.deleteOne();
      res.json({ message: 'Employee removed successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset employee password
// @route   PUT /api/auth/employees/:id/password
// @access  Private/Admin
export const resetEmployeePassword = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.password = password;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
