export interface OrderItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    _id: string;
    customerId: { _id: string; name: string; email: string; phone?: string } | string;
    products: OrderItem[];
    totalPrice: number;
    status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    shippingAddress: string;
    paymentMethod: string;
    orderDate?: string;
    notes?: string;
    createdAt?: string;
}

export interface CartItem {
    product: {
        _id: string;
        name: string;
        price: number;
        image?: string;
        stock: number;
        category: string;
    };
    quantity: number;
}

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
