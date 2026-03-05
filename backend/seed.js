const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config();

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const User = require('./models/User');
const Product = require('./models/Product');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // --- Create Admin ---
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            await User.create({
                name: 'Admin',
                email: 'admin@grocerystore.com',
                password: 'Admin@123',
                role: 'admin',
            });
            console.log('✅ Admin created: admin@grocerystore.com / Admin@123');
        } else {
            console.log('ℹ️  Admin already exists');
        }

        // --- Seed Sample Products ---
        const existingProducts = await Product.countDocuments();
        if (existingProducts === 0) {
            const products = [
                { name: 'Fresh Red Apples', category: 'Fruits & Vegetables', price: 250, stock: 100, description: 'Crispy and fresh red apples, rich in fiber and vitamins.', image: '' },
                { name: 'Organic Banana Bunch', category: 'Fruits & Vegetables', price: 120, stock: 80, description: 'Ripe organic bananas, great for breakfast and snacks.', image: '' },
                { name: 'Full Cream Milk (1L)', category: 'Dairy & Eggs', price: 180, stock: 50, description: 'Fresh full cream milk, rich in calcium and protein.', image: '' },
                { name: 'Farm Fresh Eggs (12 pcs)', category: 'Dairy & Eggs', price: 220, stock: 60, description: 'Free-range farm fresh eggs, protein-packed.', image: '' },
                { name: 'Whole Wheat Bread', category: 'Bakery', price: 150, stock: 40, description: 'Freshly baked whole wheat bread, healthy and delicious.', image: '' },
                { name: 'Mineral Water (1.5L)', category: 'Beverages', price: 80, stock: 200, description: 'Pure mineral water, essential for daily hydration.', image: '' },
                { name: 'Orange Juice (1L)', category: 'Beverages', price: 200, stock: 75, description: 'Freshly squeezed orange juice, no added sugar.', image: '' },
                { name: 'Potato Chips (Pack)', category: 'Snacks', price: 90, stock: 120, description: 'Crispy salted potato chips, perfect for snacking.', image: '' },
                { name: 'Boneless Chicken (1kg)', category: 'Meat & Seafood', price: 650, stock: 30, description: 'Fresh boneless chicken breast, high in protein.', image: '' },
                { name: 'Cooking Oil (1L)', category: 'Pantry', price: 350, stock: 55, description: 'Sunflower cooking oil, healthy and light.', image: '' },
                { name: 'Basmati Rice (5kg)', category: 'Pantry', price: 900, stock: 25, description: 'Premium aged basmati rice, long grain and aromatic.', image: '' },
                { name: 'Frozen Vegetables Mix', category: 'Frozen Foods', price: 280, stock: 45, description: 'Mixed frozen vegetables including peas, carrots, and corn.', image: '' },
            ];

            await Product.insertMany(products);
            console.log(`✅ ${products.length} sample products created`);
        } else {
            console.log(`ℹ️  Products already exist (${existingProducts} total)`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('📧 Admin: admin@grocerystore.com');
        console.log('🔑 Password: Admin@123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
};

seedData();
