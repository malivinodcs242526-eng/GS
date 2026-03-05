const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;

        let query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, category, price, stock, description } = req.body;

        const imageUrl = req.file ? req.file.path : '';

        const product = await Product.create({
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            image: imageUrl,
        });

        res.status(201).json({ success: true, message: 'Product created successfully', product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, category, price, stock, description, isActive } = req.body;

        const updateData = {
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            isActive: isActive !== undefined ? isActive : true,
        };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getProducts, getAllProductsAdmin, getProductById, createProduct, updateProduct, deleteProduct };
