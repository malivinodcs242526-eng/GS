import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, NavbarComponent, RouterLink],
    template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <!-- Loading -->
      <div class="spinner-wrapper" *ngIf="loading"><div class="spinner"></div></div>

      <!-- Not found -->
      <div class="empty-state" *ngIf="!loading && !product">
        <i class="bi bi-box-seam"></i>
        <h4>Product not found</h4>
        <a routerLink="/customer/products" class="btn-primary-custom">Back to Shop</a>
      </div>

      <div class="product-wrapper fade-in" *ngIf="!loading && product">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/customer/products">Shop</a>
          <i class="bi bi-chevron-right"></i>
          <span>{{ product.category }}</span>
          <i class="bi bi-chevron-right"></i>
          <span class="current">{{ product.name }}</span>
        </div>

        <div class="product-detail-grid">
          <!-- Image Column -->
          <div class="image-section">
            <div class="main-image">
              <img [src]="product.image || ''" [alt]="product.name" (error)="onImgError($event)" />
              <div class="out-of-stock-overlay" *ngIf="product.stock === 0">
                <span>Out of Stock</span>
              </div>
            </div>
          </div>

          <!-- Info Column -->
          <div class="info-section">
            <div class="category-tag">{{ product.category }}</div>
            <h1>{{ product.name }}</h1>

            <div class="price-section">
              <span class="price">Rs {{ product.price | number:'1.2-2' }}</span>
              <span class="per-unit">per unit</span>
            </div>

            <div class="stock-section" [class.low]="product.stock < 10 && product.stock > 0" [class.out]="product.stock === 0">
              <i [class]="product.stock === 0 ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
              <span *ngIf="product.stock === 0">Out of Stock</span>
              <span *ngIf="product.stock > 0 && product.stock < 10">Only {{ product.stock }} left!</span>
              <span *ngIf="product.stock >= 10">In Stock ({{ product.stock }} units available)</span>
            </div>

            <div class="description-section" *ngIf="product.description">
              <h3>Description</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="quantity-section" *ngIf="product.stock > 0">
              <label>Quantity</label>
              <div class="qty-control">
                <button (click)="decreaseQty()"><i class="bi bi-dash"></i></button>
                <span>{{ quantity }}</span>
                <button (click)="increaseQty()"><i class="bi bi-plus"></i></button>
              </div>
              <small>Max: {{ product.stock }}</small>
            </div>

            <div class="action-buttons">
              <button class="btn-add-cart" [disabled]="product.stock === 0" (click)="addToCart()">
                <i class="bi bi-bag-plus"></i>
                {{ cart.isInCart(product._id) ? 'Update Cart' : 'Add to Cart' }}
              </button>
              <a routerLink="/customer/cart" class="btn-view-cart" *ngIf="cart.isInCart(product._id)">
                <i class="bi bi-bag"></i> View Cart
              </a>
            </div>

            <div class="alert-custom alert-success" *ngIf="addedMsg">
              <i class="bi bi-check-circle"></i> {{ addedMsg }}
            </div>

            <!-- Product Meta -->
            <div class="product-meta">
              <div class="meta-item">
                <i class="bi bi-truck"></i>
                <span>Free delivery on orders over Rs 500</span>
              </div>
              <div class="meta-item">
                <i class="bi bi-shield-check"></i>
                <span>100% Fresh Guarantee</span>
              </div>
              <div class="meta-item">
                <i class="bi bi-arrow-counterclockwise"></i>
                <span>Easy Returns within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .product-wrapper { max-width: 1100px; margin: 0 auto; padding: 0; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; font-size: 0.88rem; color: #9ca3af;
      a { color: #2ecc71; text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
      .current { color: #374151; font-weight: 600; }
      i { font-size: 0.75rem; }
    }
    .product-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .image-section { }
    .main-image { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid #e8f5e9; background: #f8fffe; aspect-ratio: 1;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .out-of-stock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; span { background: #e74c3c; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; } }
    .info-section { display: flex; flex-direction: column; gap: 16px; }
    .category-tag { background: #eff6ff; color: #3b82f6; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
    h1 { font-size: 1.9rem; color: #1a1a2e; line-height: 1.2; }
    .price-section { display: flex; align-items: baseline; gap: 8px; }
    .price { font-size: 2rem; font-weight: 800; color: #2ecc71; }
    .per-unit { color: #9ca3af; font-size: 0.88rem; }
    .stock-section { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; color: #16a34a;
      &.low { color: #f59e0b; }
      &.out { color: #e74c3c; }
    }
    .description-section { h3 { font-size: 1rem; color: #374151; margin-bottom: 8px; } p { color: #6c757d; line-height: 1.7; font-size: 0.95rem; } }
    .quantity-section { label { display: block; font-weight: 600; font-size: 0.88rem; color: #374151; margin-bottom: 8px; } small { color: #9ca3af; font-size: 0.8rem; margin-left: 12px; } }
    .qty-control { display: inline-flex; align-items: center; border: 2px solid #e0e0e0; border-radius: 10px; overflow: hidden;
      button { background: #f3f4f6; border: none; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: all 0.2s; &:hover { background: #e5e7eb; } }
      span { padding: 0 20px; font-weight: 700; font-size: 1rem; min-width: 50px; text-align: center; }
    }
    .action-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add-cart { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s;
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,204,113,0.4); }
      &:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }
    }
    .btn-view-cart { background: white; color: #2ecc71; border: 2px solid #2ecc71; padding: 14px 24px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; text-decoration: none;
      &:hover { background: #f0fdf4; }
    }
    .alert-custom { padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 8px; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .product-meta { background: #f8fffe; border-radius: 12px; padding: 16px; border: 1px solid #e8f5e9; }
    .meta-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #e8f5e9; font-size: 0.88rem; color: #374151; &:last-child { border-bottom: none; } i { color: #2ecc71; font-size: 1.1rem; flex-shrink: 0; } }
    .empty-state { text-align: center; padding: 60px 20px; i { font-size: 3.5rem; color: #86efac; display: block; margin-bottom: 16px; } h4 { margin-bottom: 16px; } }
    .btn-primary-custom { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    @media (max-width: 768px) { .product-detail-grid { grid-template-columns: 1fr; } }
  `],
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    loading = true;
    quantity = 1;
    addedMsg = '';

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        public cart: CartService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.productService.getProductById(id).subscribe({
            next: (res) => {
                this.product = res.product;
                this.quantity = this.cart.getQuantity(res.product._id) || 1;
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    increaseQty(): void {
        if (this.product && this.quantity < this.product.stock) this.quantity++;
    }

    decreaseQty(): void {
        if (this.quantity > 1) this.quantity--;
    }

    addToCart(): void {
        if (!this.product) return;
        this.cart.addToCart(this.product, this.quantity);
        this.addedMsg = `${this.product.name} (x${this.quantity}) added to cart!`;
        setTimeout(() => (this.addedMsg = ''), 3000);
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2QxZDVkYiI+8J+SnTwvdGV4dD48L3N2Zz4=';
    }
}
