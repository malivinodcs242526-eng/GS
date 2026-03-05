import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
    selector: 'app-customer-orders',
    standalone: true,
    imports: [CommonModule, NavbarComponent, RouterLink],
    template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <div class="page-header">
        <h1><i class="bi bi-receipt"></i> My Orders</h1>
        <p>Track your orders and order history</p>
      </div>

      <!-- Loading -->
      <div class="spinner-wrapper" *ngIf="loading"><div class="spinner"></div></div>

      <!-- Empty -->
      <div class="empty-state fade-in" *ngIf="!loading && orders.length === 0">
        <i class="bi bi-bag-x"></i>
        <h4>No orders yet</h4>
        <p>Start shopping and your orders will appear here</p>
        <a routerLink="/customer/products" class="btn-primary-custom">
          <i class="bi bi-shop"></i> Start Shopping
        </a>
      </div>

      <!-- Orders -->
      <div class="orders-list fade-in-up" *ngIf="!loading && orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div class="order-meta">
              <div class="order-id">
                <i class="bi bi-receipt"></i>
                <code>#{{ order._id.slice(-8).toUpperCase() }}</code>
              </div>
              <span class="order-date">{{ order.createdAt | date:'MMMM d, y' }}</span>
            </div>
            <span class="status-badge" [ngClass]="'badge-' + order.status.toLowerCase()">
              <i [class]="statusIcon(order.status)"></i>
              {{ order.status }}
            </span>
          </div>

          <div class="order-timeline">
            <div class="timeline-step" *ngFor="let step of timelineSteps"
              [class.completed]="isStepCompleted(order.status, step)"
              [class.current]="order.status === step">
              <div class="step-dot"></div>
              <span>{{ step }}</span>
            </div>
          </div>

          <div class="order-items">
            <div class="order-item" *ngFor="let item of order.products">
              <img [src]="item.image || ''" [alt]="item.name" class="item-img" (error)="onImgError($event)" />
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">Qty: {{ item.quantity }} × Rs {{ item.price | number:'1.2-2' }}</span>
              </div>
              <span class="item-subtotal">Rs {{ (item.price * item.quantity) | number:'1.0-0' }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="shipping-details">
              <div class="detail-row">
                <i class="bi bi-geo-alt"></i>
                <span>{{ order.shippingAddress }}</span>
              </div>
              <div class="detail-row">
                <i class="bi bi-credit-card"></i>
                <span>{{ order.paymentMethod }}</span>
              </div>
              <div class="detail-row" *ngIf="order.notes">
                <i class="bi bi-chat-text"></i>
                <span>{{ order.notes }}</span>
              </div>
            </div>
            <div class="order-total">
              <span>Order Total</span>
              <strong>Rs {{ order.totalPrice | number:'1.2-2' }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-header { margin-bottom: 24px; h1 { font-size: 1.7rem; color: #1a1a2e; display: flex; align-items: center; gap: 10px; i { color: #2ecc71; } } p { color: #6c757d; font-size: 0.9rem; margin-top: 4px; } }
    .orders-list { display: flex; flex-direction: column; gap: 20px; }
    .order-card { background: white; border-radius: 14px; border: 1px solid #e8f5e9; box-shadow: 0 2px 10px rgba(46,204,113,0.08); overflow: hidden; }
    .order-header { padding: 16px 20px; background: linear-gradient(to right, #f8fffe, white); border-bottom: 1px solid #e8f5e9; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .order-meta { display: flex; align-items: center; gap: 16px; }
    .order-id { display: flex; align-items: center; gap: 8px; color: #6c757d; code { background: #1a1a2e; color: #2ecc71; padding: 3px 10px; border-radius: 6px; font-size: 0.82rem; } }
    .order-date { color: #9ca3af; font-size: 0.82rem; }
    .status-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-confirmed { background: #cce5ff; color: #004085; }
    .badge-processing { background: #d4edda; color: #155724; }
    .badge-shipped { background: #d1ecf1; color: #0c5460; }
    .badge-delivered { background: #d4edda; color: #155724; }
    .badge-cancelled { background: #f8d7da; color: #721c24; }
    .order-timeline { padding: 16px 20px; display: flex; align-items: center; overflow-x: auto; gap: 0; border-bottom: 1px solid #f0f0f0; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; gap: 6px;
      &:not(:last-child)::after { content: ''; position: absolute; top: 8px; left: 50%; width: 100%; height: 2px; background: #e0e0e0; z-index: 0; }
      &.completed::after { background: #2ecc71; }
    }
    .step-dot { width: 18px; height: 18px; border-radius: 50%; background: #e0e0e0; border: 2px solid #e0e0e0; z-index: 1; position: relative; }
    .timeline-step.completed .step-dot { background: #2ecc71; border-color: #2ecc71; }
    .timeline-step.current .step-dot { background: white; border: 3px solid #2ecc71; box-shadow: 0 0 0 3px rgba(46,204,113,0.2); }
    .timeline-step span { font-size: 0.7rem; color: #9ca3af; white-space: nowrap; font-weight: 500; }
    .timeline-step.completed span, .timeline-step.current span { color: #2ecc71; font-weight: 700; }
    .order-items { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid #f0f0f0; }
    .order-item { display: flex; align-items: center; gap: 12px; }
    .item-img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0; flex-shrink: 0; }
    .item-info { flex: 1; }
    .item-name { display: block; font-size: 0.9rem; font-weight: 600; color: #1a1a2e; }
    .item-qty { display: block; font-size: 0.8rem; color: #9ca3af; }
    .item-subtotal { font-weight: 700; color: #2ecc71; font-size: 0.92rem; }
    .order-footer { padding: 14px 20px; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .shipping-details { display: flex; flex-direction: column; gap: 6px; }
    .detail-row { display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; color: #6c757d; i { color: #2ecc71; margin-top: 2px; flex-shrink: 0; } }
    .order-total { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; span { color: #9ca3af; font-size: 0.82rem; } strong { font-size: 1.3rem; color: #1a1a2e; } }
    .empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 14px; border: 1px solid #e8f5e9; i { font-size: 4rem; color: #86efac; display: block; margin-bottom: 16px; } h4 { font-size: 1.4rem; margin-bottom: 8px; } p { color: #9ca3af; margin-bottom: 24px; } }
    .btn-primary-custom { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; transition: all 0.3s; border: none; cursor: pointer; &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,204,113,0.4); } }
  `],
})
export class CustomerOrdersComponent implements OnInit {
    orders: Order[] = [];
    loading = true;
    timelineSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.orderService.getMyOrders().subscribe({
            next: (res) => { this.orders = res.orders; this.loading = false; },
            error: () => { this.loading = false; },
        });
    }

    isStepCompleted(currentStatus: string, step: string): boolean {
        const idx = this.timelineSteps.indexOf(currentStatus);
        const stepIdx = this.timelineSteps.indexOf(step);
        return stepIdx <= idx && currentStatus !== 'Cancelled';
    }

    statusIcon(status: string): string {
        const icons: Record<string, string> = {
            'Pending': 'bi bi-clock', 'Confirmed': 'bi bi-check', 'Processing': 'bi bi-gear',
            'Shipped': 'bi bi-truck', 'Delivered': 'bi bi-check-circle', 'Cancelled': 'bi bi-x-circle',
        };
        return icons[status] || 'bi bi-circle';
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHJ4PSI4IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
    }
}
