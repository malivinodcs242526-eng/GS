import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/order.model';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, NavbarComponent, RouterLink, ReactiveFormsModule],
    template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <div class="page-header">
        <h1><i class="bi bi-bag"></i> Shopping Cart</h1>
        <p>{{ cart.cartCount }} item(s) in your cart</p>
      </div>

      <!-- Empty Cart -->
      <div class="empty-cart fade-in" *ngIf="cartItems.length === 0">
        <div class="empty-icon"><i class="bi bi-bag-x"></i></div>
        <h3>Your cart is empty</h3>
        <p>Browse our products and add items to your cart</p>
        <a routerLink="/customer/products" class="btn-shop">
          <i class="bi bi-shop"></i> Start Shopping
        </a>
      </div>

      <!-- Cart Content -->
      <div class="cart-layout fade-in-up" *ngIf="cartItems.length > 0">
        <!-- Cart Items -->
        <div class="cart-items-section">
          <div class="cart-item" *ngFor="let item of cartItems">
            <img [src]="item.product.image || ''" [alt]="item.product.name" class="item-img" (error)="onImgError($event)" />
            <div class="item-info">
              <h4>{{ item.product.name }}</h4>
              <span class="item-category">{{ item.product.category }}</span>
              <span class="item-price">Rs {{ item.product.price | number:'1.2-2' }}</span>
            </div>
            <div class="item-controls">
              <div class="qty-control">
                <button (click)="updateQty(item, item.quantity - 1)"><i class="bi bi-dash"></i></button>
                <span>{{ item.quantity }}</span>
                <button (click)="updateQty(item, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock"><i class="bi bi-plus"></i></button>
              </div>
              <span class="item-total">Rs {{ (item.product.price * item.quantity) | number:'1.2-2' }}</span>
              <button class="btn-remove" (click)="removeItem(item.product._id)">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>

          <div class="cart-actions">
            <button class="btn-clear" (click)="clearCart()">
              <i class="bi bi-trash"></i> Clear Cart
            </button>
            <a routerLink="/customer/products" class="btn-continue">
              <i class="bi bi-arrow-left"></i> Continue Shopping
            </a>
          </div>
        </div>

        <!-- Order Summary + Checkout -->
        <div class="order-summary-section">
          <div class="summary-card">
            <h3>Order Summary</h3>

            <div class="summary-lines">
              <div class="summary-line" *ngFor="let item of cartItems">
                <span>{{ item.product.name }} × {{ item.quantity }}</span>
                <span>Rs {{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
              </div>
            </div>

            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>Total</span>
              <strong>Rs {{ cart.cartTotal | number:'1.2-2' }}</strong>
            </div>

            <!-- Checkout Form -->
            <div class="checkout-form" *ngIf="!orderPlaced">
              <h4>Delivery Details</h4>
              <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
                <div class="form-group">
                  <label>Shipping Address *</label>
                  <textarea formControlName="shippingAddress" class="form-control-custom" rows="3"
                    placeholder="Enter your delivery address..." [class.is-invalid]="submitted && cf['shippingAddress'].errors"></textarea>
                  <small *ngIf="submitted && cf['shippingAddress'].errors?.['required']" class="error-text">Address is required</small>
                </div>
                <div class="form-group">
                  <label>Payment Method</label>
                  <select formControlName="paymentMethod" class="form-control-custom">
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Notes (optional)</label>
                  <input type="text" formControlName="notes" class="form-control-custom" placeholder="Any special instructions?" />
                </div>

                <div class="alert-custom alert-danger" *ngIf="orderError">
                  <i class="bi bi-exclamation-triangle"></i> {{ orderError }}
                </div>

                <button type="submit" class="btn-place-order" [disabled]="placing">
                  <span *ngIf="placing" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-bag-check" *ngIf="!placing"></i>
                  {{ placing ? 'Placing Order...' : 'Place Order' }}
                </button>
              </form>
            </div>

            <!-- Order Success -->
            <div class="order-success" *ngIf="orderPlaced">
              <div class="success-icon"><i class="bi bi-check-circle-fill"></i></div>
              <h4>Order Placed!</h4>
              <p>Your order has been placed successfully.</p>
              <a routerLink="/customer/orders" class="btn-view-orders">
                <i class="bi bi-receipt"></i> View Orders
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-header { margin-bottom: 24px; h1 { font-size: 1.7rem; color: #1a1a2e; display: flex; align-items: center; gap: 10px; i { color: #2ecc71; } } p { color: #6c757d; font-size: 0.9rem; margin-top: 4px; } }
    .empty-cart { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; border: 1px solid #e8f5e9; }
    .empty-icon i { font-size: 5rem; color: #86efac; display: block; margin-bottom: 16px; }
    .empty-cart h3 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 8px; }
    .empty-cart p { color: #9ca3af; margin-bottom: 24px; }
    .btn-shop { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,204,113,0.4); } }
    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
    .cart-items-section { background: white; border-radius: 12px; border: 1px solid #e8f5e9; overflow: hidden; }
    .cart-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s; &:hover { background: #fafffe; } }
    .item-img { width: 70px; height: 70px; object-fit: cover; border-radius: 10px; border: 1px solid #e0e0e0; flex-shrink: 0; }
    .item-info { flex: 1; h4 { font-size: 0.95rem; color: #1a1a2e; margin-bottom: 3px; } }
    .item-category { display: block; color: #9ca3af; font-size: 0.78rem; margin-bottom: 4px; }
    .item-price { color: #2ecc71; font-weight: 700; font-size: 0.92rem; }
    .item-controls { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .qty-control { display: flex; align-items: center; border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden;
      button { background: #f3f4f6; border: none; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; &:hover:not(:disabled) { background: #e5e7eb; } &:disabled { opacity: 0.4; cursor: not-allowed; } }
      span { padding: 0 14px; font-weight: 700; font-size: 0.9rem; }
    }
    .item-total { font-weight: 700; color: #1a1a2e; font-size: 0.95rem; min-width: 90px; text-align: right; }
    .btn-remove { background: none; border: none; color: #e74c3c; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; font-size: 1rem; &:hover { background: #fef2f2; } }
    .cart-actions { padding: 16px 20px; display: flex; align-items: center; gap: 12px; border-top: 1px solid #f0f0f0; }
    .btn-clear { background: #fef2f2; color: #e74c3c; border: 1px solid #fecaca; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; &:hover { background: #fee2e2; } }
    .btn-continue { color: #2ecc71; text-decoration: none; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 6px; &:hover { text-decoration: underline; } }
    .summary-card { background: white; border-radius: 12px; border: 1px solid #e8f5e9; padding: 20px; box-shadow: 0 4px 16px rgba(46,204,113,0.08); h3 { font-size: 1.2rem; color: #1a1a2e; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0; } }
    .summary-lines { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .summary-line { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; color: #6c757d; }
    .summary-divider { height: 1px; background: #f0f0f0; margin: 12px 0; }
    .summary-total { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; span { font-size: 1rem; color: #374151; } strong { font-size: 1.4rem; color: #2ecc71; } }
    .checkout-form { h4 { font-size: 1rem; color: #1a1a2e; margin-bottom: 14px; padding-top: 4px; border-top: 1px solid #f0f0f0; padding-top: 16px; } }
    .form-group { margin-bottom: 12px; label { display: block; font-weight: 600; font-size: 0.85rem; color: #374151; margin-bottom: 5px; } }
    .form-control-custom { width: 100%; padding: 10px 13px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.88rem; font-family: 'Inter',sans-serif; transition: all 0.2s; &:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 0 3px rgba(46,204,113,0.12); } &.is-invalid { border-color: #e74c3c; } }
    textarea.form-control-custom { resize: vertical; }
    .error-text { color: #e74c3c; font-size: 0.78rem; display: block; margin-top: 3px; }
    .alert-custom { padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .alert-danger { background: #fdecea; color: #721c24; border: 1px solid #f5c6cb; }
    .btn-place-order { width: 100%; background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; padding: 13px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,204,113,0.4); } &:disabled { opacity: 0.7; cursor: not-allowed; } }
    .order-success { text-align: center; padding: 24px 0; }
    .success-icon i { font-size: 3.5rem; color: #2ecc71; display: block; margin-bottom: 12px; }
    .order-success h4 { font-size: 1.2rem; color: #1a1a2e; margin-bottom: 8px; }
    .order-success p { color: #6c757d; font-size: 0.9rem; margin-bottom: 16px; }
    .btn-view-orders { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; transition: all 0.3s; &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,204,113,0.4); } }
    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .cart-item { flex-wrap: wrap; } .item-controls { width: 100%; justify-content: space-between; } }
  `],
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];
    checkoutForm: FormGroup;
    loading = false;
    placing = false;
    submitted = false;
    orderPlaced = false;
    orderError = '';

    constructor(
        public cart: CartService,
        private orderService: OrderService,
        private auth: AuthService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.checkoutForm = this.fb.group({
            shippingAddress: [this.auth.currentUser?.address || '', Validators.required],
            paymentMethod: ['Cash on Delivery'],
            notes: [''],
        });
    }

    ngOnInit(): void {
        this.cart.cart$.subscribe((items) => (this.cartItems = items));
    }

    get cf() { return this.checkoutForm.controls; }

    updateQty(item: CartItem, qty: number): void {
        if (qty < 1) { this.removeItem(item.product._id); return; }
        if (qty > item.product.stock) return;
        this.cart.updateQuantity(item.product._id, qty);
    }

    removeItem(id: string): void {
        this.cart.removeFromCart(id);
    }

    clearCart(): void {
        if (confirm('Clear all items from cart?')) {
            this.cart.clearCart();
        }
    }

    placeOrder(): void {
        this.submitted = true;
        this.orderError = '';
        if (this.checkoutForm.invalid) return;

        this.placing = true;
        const orderData = {
            products: this.cartItems.map((i) => ({ product: i.product._id, quantity: i.quantity })),
            shippingAddress: this.cf['shippingAddress'].value,
            paymentMethod: this.cf['paymentMethod'].value,
            notes: this.cf['notes'].value,
        };

        this.orderService.createOrder(orderData).subscribe({
            next: () => {
                this.cart.clearCart();
                this.orderPlaced = true;
                this.placing = false;
            },
            error: (err) => {
                this.orderError = err.error?.message || 'Failed to place order. Please try again.';
                this.placing = false;
            },
        });
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHJ4PSIxMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==';
    }
}
