import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent],
    template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <div class="page-header fade-in">
        <h1><i class="bi bi-speedometer2"></i> Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening in your store.</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid fade-in-up" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon orders"><i class="bi bi-bag-check"></i></div>
          <div class="stat-info">
            <h3>{{ stats.totalOrders }}</h3>
            <p>Total Orders</p>
          </div>
          <a routerLink="/admin/orders" class="stat-link">View all →</a>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending"><i class="bi bi-clock-history"></i></div>
          <div class="stat-info">
            <h3>{{ stats.pendingOrders }}</h3>
            <p>Pending Orders</p>
          </div>
          <a routerLink="/admin/orders" class="stat-link">Process now →</a>
        </div>
        <div class="stat-card">
          <div class="stat-icon revenue"><i class="bi bi-currency-dollar"></i></div>
          <div class="stat-info">
            <h3>Rs {{ stats.totalRevenue | number:'1.0-0' }}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon products"><i class="bi bi-box-seam"></i></div>
          <div class="stat-info">
            <h3>{{ stats.totalProducts }}</h3>
            <p>Active Products</p>
          </div>
          <a routerLink="/admin/products" class="stat-link">Manage →</a>
        </div>
        <div class="stat-card">
          <div class="stat-icon customers"><i class="bi bi-people"></i></div>
          <div class="stat-info">
            <h3>{{ stats.totalCustomers }}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon delivered"><i class="bi bi-check-circle"></i></div>
          <div class="stat-info">
            <h3>{{ stats.deliveredOrders }}</h3>
            <p>Delivered Orders</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="spinner-wrapper" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions fade-in-up">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/admin/products" class="action-card">
            <div class="action-icon"><i class="bi bi-plus-circle"></i></div>
            <h4>Add Product</h4>
            <p>Add new products to your store</p>
          </a>
          <a routerLink="/admin/orders" class="action-card">
            <div class="action-icon orders"><i class="bi bi-list-ul"></i></div>
            <h4>Manage Orders</h4>
            <p>View and update order statuses</p>
          </a>
          <a routerLink="/admin/products" class="action-card">
            <div class="action-icon products"><i class="bi bi-grid"></i></div>
            <h4>View Products</h4>
            <p>Manage your product catalog</p>
          </a>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="recent-orders fade-in-up" *ngIf="recentOrders.length > 0">
        <div class="section-header">
          <h2>Recent Orders</h2>
          <a routerLink="/admin/orders" class="view-all">View All Orders →</a>
        </div>
        <div class="table-wrapper">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of recentOrders">
                <td><code>#{{ order._id.slice(-6).toUpperCase() }}</code></td>
                <td>
                  <strong>{{ getCustomerName(order) }}</strong><br>
                  <small>{{ getCustomerEmail(order) }}</small>
                </td>
                <td>{{ order.products.length }} item(s)</td>
                <td><strong>Rs {{ order.totalPrice | number:'1.0-0' }}</strong></td>
                <td>
                  <span class="status-badge" [ngClass]="'badge-' + order.status.toLowerCase()">
                    {{ order.status }}
                  </span>
                </td>
                <td>{{ order.createdAt | date:'MMM d, y' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-header { margin-bottom: 28px; h1 { font-size: 1.8rem; color: #1a1a2e; display: flex; align-items: center; gap: 12px; i { color: #2ecc71; } } p { color: #6c757d; margin-top: 4px; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(46,204,113,0.1); border: 1px solid #e8f5e9; display: flex; flex-direction: column; gap: 12px; transition: all 0.3s;
      &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    }
    .stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; background: #f0fdf4; color: #2ecc71;
      &.orders { background: #eff6ff; color: #3b82f6; }
      &.pending { background: #fffbeb; color: #f59e0b; }
      &.revenue { background: #f0fdf4; color: #2ecc71; }
      &.products { background: #faf5ff; color: #8b5cf6; }
      &.customers { background: #fff1f2; color: #f43f5e; }
      &.delivered { background: #f0fdf4; color: #10b981; }
    }
    .stat-info { h3 { font-size: 1.8rem; font-weight: 700; color: #1a1a2e; margin: 0; } p { color: #6c757d; font-size: 0.85rem; margin: 0; } }
    .stat-link { color: #2ecc71; font-size: 0.82rem; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
    .quick-actions { margin-bottom: 28px; h2 { font-size: 1.3rem; margin-bottom: 16px; color: #1a1a2e; } }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    .action-card { background: white; border-radius: 12px; padding: 20px; text-decoration: none; color: inherit; border: 1px solid #e8f5e9; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
      &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: #2ecc71; }
    }
    .action-icon { width: 52px; height: 52px; border-radius: 12px; background: #f0fdf4; color: #2ecc71; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
      &.orders { background: #eff6ff; color: #3b82f6; }
      &.products { background: #faf5ff; color: #8b5cf6; }
    }
    .action-card h4 { font-size: 0.95rem; color: #1a1a2e; margin: 0; }
    .action-card p { font-size: 0.82rem; color: #6c757d; margin: 0; }
    .recent-orders { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(46,204,113,0.1); border: 1px solid #e8f5e9; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; h2 { font-size: 1.2rem; color: #1a1a2e; } }
    .view-all { color: #2ecc71; font-size: 0.88rem; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
    .table-wrapper { overflow-x: auto; }
    code { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; color: #1a1a2e; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-confirmed { background: #cce5ff; color: #004085; }
    .badge-processing { background: #d4edda; color: #155724; }
    .badge-shipped { background: #d1ecf1; color: #0c5460; }
    .badge-delivered { background: #d4edda; color: #155724; }
    .badge-cancelled { background: #f8d7da; color: #721c24; }
  `],
})
export class DashboardComponent implements OnInit {
    stats: any = null;
    recentOrders: any[] = [];
    loading = true;

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.orderService.getDashboardStats().subscribe({
            next: (res) => {
                this.stats = res.stats;
                this.recentOrders = res.recentOrders;
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    getCustomerName(order: any): string {
        return typeof order.customerId === 'object' ? order.customerId.name : 'Unknown';
    }

    getCustomerEmail(order: any): string {
        return typeof order.customerId === 'object' ? order.customerId.email : '';
    }
}
