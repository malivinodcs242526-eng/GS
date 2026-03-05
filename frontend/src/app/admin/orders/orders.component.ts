import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { OrderService } from '../../services/order.service';
import { Order, ORDER_STATUSES } from '../../models/order.model';
// Note: Angular templates don't support spread operator - use allStatusFilters getter instead

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1><i class="bi bi-list-check"></i> Order Management</h1>
          <p>View and manage all customer orders</p>
        </div>
        <span class="total-badge">{{ totalOrders }} Total Orders</span>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="toast-notification" [class]="toast.type">
        <i [class]="toast.type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'"></i>
        {{ toast.message }}
      </div>

      <!-- Filters -->
      <div class="filters-bar fade-in">
        <button *ngFor="let s of allStatusFilters" class="filter-btn"
          [class.active]="selectedStatus === s"
          (click)="filterOrders(s)">
          {{ s }}
        </button>
      </div>

      <!-- Loading -->
      <div class="spinner-wrapper" *ngIf="loading"><div class="spinner"></div></div>

      <!-- Empty -->
      <div *ngIf="!loading && orders.length === 0" class="empty-state">
        <i class="bi bi-receipt"></i>
        <h4>No orders found</h4>
        <p>No orders match the current filter</p>
      </div>

      <!-- Orders List -->
      <div class="orders-list fade-in-up" *ngIf="!loading && orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div class="order-id">
              <code>#{{ order._id.slice(-8).toUpperCase() }}</code>
              <span class="order-date">{{ order.createdAt | date:'MMM d, y, h:mm a' }}</span>
            </div>
            <div class="order-status-control">
              <select class="status-select" [value]="order.status" (change)="updateStatus(order._id, $event)">
                <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="order-body">
            <div class="customer-info">
              <div class="customer-avatar">{{ getInitial(order) }}</div>
              <div>
                <strong>{{ getCustomerName(order) }}</strong>
                <small>{{ getCustomerEmail(order) }}</small>
                <small *ngIf="getCustomerPhone(order)">{{ getCustomerPhone(order) }}</small>
              </div>
            </div>

            <div class="order-items">
              <div class="item-row" *ngFor="let item of order.products">
                <img [src]="item.image || ''" class="item-img" [alt]="item.name" (error)="onImgError($event)" />
                <div class="item-details">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-qty">Qty: {{ item.quantity }}</span>
                </div>
                <span class="item-price">Rs {{ (item.price * item.quantity) | number:'1.0-0' }}</span>
              </div>
            </div>

            <div class="order-footer">
              <div class="shipping-info">
                <i class="bi bi-geo-alt"></i>
                <span>{{ order.shippingAddress }}</span>
              </div>
              <div class="order-total">
                <span>Total:</span>
                <strong>Rs {{ order.totalPrice | number:'1.0-0' }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
      h1 { font-size: 1.7rem; color: #1a1a2e; display: flex; align-items: center; gap: 10px; i { color: #2ecc71; } }
      p { color: #6c757d; margin-top: 4px; font-size: 0.9rem; }
    }
    .total-badge { background: #1a1a2e; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
    .filters-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn { padding: 7px 16px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: white; cursor: pointer; transition: all 0.2s; color: #374151;
      &:hover { border-color: #2ecc71; color: #2ecc71; }
      &.active { background: #2ecc71; border-color: #2ecc71; color: white; }
    }
    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { background: white; border-radius: 12px; border: 1px solid #e8f5e9; box-shadow: 0 2px 8px rgba(46,204,113,0.08); overflow: hidden; transition: all 0.2s;
      &:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
    }
    .order-header { padding: 14px 20px; background: #f8fffe; border-bottom: 1px solid #e8f5e9; display: flex; align-items: center; justify-content: space-between; }
    .order-id { display: flex; align-items: center; gap: 12px; code { background: #1a1a2e; color: #2ecc71; padding: 3px 10px; border-radius: 6px; font-size: 0.85rem; } }
    .order-date { color: #9ca3af; font-size: 0.82rem; }
    .status-select { padding: 7px 28px 7px 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.85rem; font-weight: 600; background: white; cursor: pointer; transition: all 0.2s; &:focus { outline: none; border-color: #2ecc71; } }
    .order-body { padding: 16px 20px; }
    .customer-info { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .customer-avatar { width: 40px; height: 40px; background: linear-gradient(135deg,#2ecc71,#27ae60); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0; }
    .customer-info strong { display: block; font-size: 0.92rem; color: #1a1a2e; }
    .customer-info small { display: block; color: #9ca3af; font-size: 0.8rem; }
    .order-items { background: #f8fffe; border-radius: 8px; padding: 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
    .item-row { display: flex; align-items: center; gap: 10px; }
    .item-img { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; border: 1px solid #e0e0e0; flex-shrink: 0; }
    .item-details { flex: 1; }
    .item-name { display: block; font-size: 0.88rem; font-weight: 600; color: #1a1a2e; }
    .item-qty { display: block; font-size: 0.78rem; color: #9ca3af; }
    .item-price { font-weight: 700; color: #2ecc71; font-size: 0.9rem; }
    .order-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e8f5e9; flex-wrap: wrap; gap: 10px; }
    .shipping-info { display: flex; align-items: center; gap: 6px; color: #6c757d; font-size: 0.85rem; i { color: #2ecc71; } }
    .order-total { display: flex; align-items: center; gap: 8px; span { color: #6c757d; font-size: 0.88rem; } strong { color: #1a1a2e; font-size: 1.1rem; } }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; button { background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 8px 14px; cursor: pointer; transition: all 0.2s; &:hover:not(:disabled) { border-color: #2ecc71; color: #2ecc71; } &:disabled { opacity: 0.4; cursor: not-allowed; } } span { font-weight: 600; color: #374151; } }
    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px solid #e8f5e9; i { font-size: 3.5rem; color: #86efac; display: block; margin-bottom: 12px; } h4 { color: #1a1a2e; } p { color: #9ca3af; } }
    .toast-notification { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 14px 20px; border-radius: 10px; color: white; font-weight: 500; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; animation: fadeInUp 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.2); &.success { background: #1a1a2e; border-left: 4px solid #2ecc71; } &.error { background: #1a1a2e; border-left: 4px solid #e74c3c; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  statuses = ORDER_STATUSES;
  get allStatusFilters(): string[] { return ['All', ...this.statuses]; }
  selectedStatus = 'All';
  loading = true;
  totalOrders = 0;
  currentPage = 1;
  totalPages = 1;
  toast: { message: string; type: string } | null = null;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders({ status: this.selectedStatus, page: this.currentPage, limit: 10 }).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.totalOrders = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  filterOrders(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  updateStatus(orderId: string, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (res) => {
        const idx = this.orders.findIndex((o) => o._id === orderId);
        if (idx !== -1) this.orders[idx].status = status as any;
        this.showToast('Status updated successfully', 'success');
      },
      error: () => this.showToast('Failed to update status', 'error'),
    });
  }

  getCustomerName(order: Order): string {
    return typeof order.customerId === 'object' ? (order.customerId as any).name : 'Unknown';
  }
  getCustomerEmail(order: Order): string {
    return typeof order.customerId === 'object' ? (order.customerId as any).email : '';
  }
  getCustomerPhone(order: Order): string {
    return typeof order.customerId === 'object' ? (order.customerId as any).phone || '' : '';
  }
  getInitial(order: Order): string {
    return this.getCustomerName(order).charAt(0).toUpperCase();
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHJ4PSI2IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
  }

  showToast(message: string, type: string): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }
}
