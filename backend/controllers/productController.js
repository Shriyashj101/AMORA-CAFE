import Product from '../models/Product.js';

// @desc    Fetch all products (menu items) with optional search & filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, keyword, branch, special } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (branch) {
      query.branch = branch;
    }
    if (special === 'true') {
      query.isSpecial = true;
    }
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ popularity: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, price, description, category, image, branch, isSpecial } = req.body;

  try {
    const product = new Product({
      name: name || 'New Menu Item',
      price: price || 0,
      description: description || 'No description provided',
      category: category || 'Meals',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      branch: branch || 'Main Branch',
      isSpecial: isSpecial || false,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, price, description, category, image, branch, isSpecial } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description !== undefined ? description : product.description;
      product.category = category !== undefined ? category : product.category;
      product.image = image !== undefined ? image : product.image;
      product.branch = branch !== undefined ? branch : product.branch;
      product.isSpecial = isSpecial !== undefined ? isSpecial : product.isSpecial;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI recommendations (popular and specials combined)
// @route   GET /api/products/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    // Get top 4 most popular or special menu items
    const recommendations = await Product.find({}).sort({ popularity: -1, isSpecial: -1 }).limit(4);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
