const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
});

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        products: [orderItemSchema],
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        shippingAddress: {
            type: String,
            required: [true, 'Shipping address is required'],
        },
        paymentMethod: {
            type: String,
            enum: ['Cash on Delivery', 'Online Payment'],
            default: 'Cash on Delivery',
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            maxlength: 300,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
