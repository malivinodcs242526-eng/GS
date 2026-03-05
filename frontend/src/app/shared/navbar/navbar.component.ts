import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Brand -->
        <a class="navbar-brand" [routerLink]="brandRoute">
          <i class="bi bi-cart3"></i>
          <span>GroceryMart</span>
        </a>

        <!-- Admin Nav -->
        <div class="navbar-links" *ngIf="auth.isAdmin">
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active">
            <i class="bi bi-box-seam"></i> Products
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active">
            <i class="bi bi-list-check"></i> Orders
          </a>
        </div>

        <!-- Customer Nav -->
        <div class="navbar-links" *ngIf="auth.isCustomer">
          <a routerLink="/customer/products" routerLinkActive="active">
            <i class="bi bi-shop"></i> Shop
          </a>
          <a routerLink="/customer/cart" routerLinkActive="active" class="cart-link">
            <i class="bi bi-bag"></i>
            Cart
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </a>
          <a routerLink="/customer/orders" routerLinkActive="active">
            <i class="bi bi-receipt"></i> Orders
          </a>
        </div>

        <!-- User info + Logout -->
        <div class="navbar-right">
          <div class="user-info">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-details">
              <span class="user-name">{{ auth.currentUser?.name }}</span>
              <span class="user-role" [class]="auth.isAdmin ? 'role-admin' : 'role-customer'">
                {{ auth.currentUser?.role | titlecase }}
              </span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </nav>
  `,
    styles: [`
    .navbar {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 0 24px;
      height: 70px;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .navbar-container {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 24px;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.3rem;
      flex-shrink: 0;
      i { color: #2ecc71; font-size: 1.5rem; }
    }
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      a {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        text-decoration: none;
        color: rgba(255,255,255,0.7);
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
        &:hover, &.active {
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
        }
      }
    }
    .cart-link { position: relative; }
    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e74c3c;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .user-details { display: flex; flex-direction: column; }
    .user-name { color: white; font-size: 0.85rem; font-weight: 600; }
    .user-role {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 1px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .role-admin { background: rgba(243, 156, 18, 0.2); color: #f39c12; }
    .role-customer { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
    .logout-btn {
      background: rgba(231, 76, 60, 0.15);
      border: 1px solid rgba(231, 76, 60, 0.3);
      color: #e74c3c;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1.1rem;
      &:hover { background: rgba(231, 76, 60, 0.3); }
    }
    @media (max-width: 768px) {
      .user-details { display: none; }
      .navbar-links a span { display: none; }
    }
  `],
})
export class NavbarComponent implements OnInit {
    cartCount = 0;
    userInitial = '';
    brandRoute = '/auth/login';

    constructor(public auth: AuthService, private cart: CartService, private router: Router) { }

    ngOnInit(): void {
        this.cart.cart$.subscribe(() => {
            this.cartCount = this.cart.cartCount;
        });
        const user = this.auth.currentUser;
        this.userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
        this.brandRoute = this.auth.isAdmin ? '/admin/dashboard' : '/customer/products';
    }

    logout(): void {
        this.auth.logout();
    }
}
