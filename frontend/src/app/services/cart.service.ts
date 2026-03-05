import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
    private cartKey = 'gs_cart';
    private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
    cart$ = this.cartSubject.asObservable();

    private loadCart(): CartItem[] {
        try {
            const cart = localStorage.getItem(this.cartKey);
            return cart ? JSON.parse(cart) : [];
        } catch {
            return [];
        }
    }

    private saveCart(items: CartItem[]): void {
        localStorage.setItem(this.cartKey, JSON.stringify(items));
        this.cartSubject.next(items);
    }

    get cartItems(): CartItem[] {
        return this.cartSubject.value;
    }

    get cartCount(): number {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    get cartTotal(): number {
        return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    addToCart(product: Product, quantity = 1): void {
        const items = [...this.cartItems];
        const existing = items.find((i) => i.product._id === product._id);

        if (existing) {
            const newQty = existing.quantity + quantity;
            existing.quantity = Math.min(newQty, product.stock);
        } else {
            items.push({
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    stock: product.stock,
                    category: product.category,
                },
                quantity,
            });
        }

        this.saveCart(items);
    }

    updateQuantity(productId: string, quantity: number): void {
        const items = this.cartItems.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
        );
        this.saveCart(items);
    }

    removeFromCart(productId: string): void {
        const items = this.cartItems.filter((item) => item.product._id !== productId);
        this.saveCart(items);
    }

    clearCart(): void {
        localStorage.removeItem(this.cartKey);
        this.cartSubject.next([]);
    }

    isInCart(productId: string): boolean {
        return this.cartItems.some((i) => i.product._id === productId);
    }

    getQuantity(productId: string): number {
        return this.cartItems.find((i) => i.product._id === productId)?.quantity || 0;
    }
}
