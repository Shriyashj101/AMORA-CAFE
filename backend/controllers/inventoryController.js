import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = async (req, res) => {
  const { branch } = req.query;
  try {
    let query = {};
    if (branch) {
      query.branch = branch;
    }
    const items = await Inventory.find(query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
  const { name, stock, unit, minThreshold, branch } = req.body;

  try {
    const item = new Inventory({
      name,
      stock,
      unit,
      minThreshold,
      branch: branch || 'Main Branch',
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
  const { name, stock, unit, minThreshold, branch } = req.body;

  try {
    const item = await Inventory.findById(req.params.id);

    if (item) {
      item.name = name !== undefined ? name : item.name;
      item.stock = stock !== undefined ? stock : item.stock;
      item.unit = unit !== undefined ? unit : item.unit;
      item.minThreshold = minThreshold !== undefined ? minThreshold : item.minThreshold;
      item.branch = branch !== undefined ? branch : item.branch;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (item) {
      await item.deleteOne();
      res.json({ message: 'Inventory item removed' });
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
