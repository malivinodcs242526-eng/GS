export interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductResponse {
    success: boolean;
    products: Product[];
    total?: number;
    page?: number;
    totalPages?: number;
}

export const PRODUCT_CATEGORIES = [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Bakery',
    'Beverages',
    'Snacks',
    'Frozen Foods',
    'Pantry',
    'Personal Care',
    'Household',
    'Other',
];
