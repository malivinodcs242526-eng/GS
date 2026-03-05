const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'customer',
            phone,
            address,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    console.log(`[LOGIN ATTEMPT] Email: '${email}', Password: '${password}'`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create admin (seed only - first time setup)
// @route   POST /api/auth/create-admin
// @access  Public (should be disabled after setup)
const createAdmin = async (req, res) => {
    try {
        const existing = await User.findOne({ role: 'admin' });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@grocerystore.com',
            password: 'Admin@123',
            role: 'admin',
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            credentials: { email: 'admin@grocerystore.com', password: 'Admin@123' },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getMe, createAdmin };
