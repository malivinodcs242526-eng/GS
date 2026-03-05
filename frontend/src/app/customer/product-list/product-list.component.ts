import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, PRODUCT_CATEGORIES } from '../../models/product.model';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, NavbarComponent, RouterLink, FormsModule],
    template: `
    <app-navbar></app-navbar>

    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1>🛒 Fresh Groceries, Delivered Fast</h1>
        <p>Shop from our wide selection of fresh and quality products</p>
        <div class="search-bar">
          <i class="bi bi-search"></i>
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
            placeholder="Search for products..." />
          <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="page-wrapper">
      <!-- Toast -->
      <div *ngIf="toast" class="toast-notification success">
        <i class="bi bi-bag-check"></i> {{ toast }}
      </div>

      <!-- Category Filter -->
      <div class="category-filter fade-in">
        <button class="cat-btn" [class.active]="selectedCategory === 'All'" (click)="filterCategory('All')">
          <i class="bi bi-grid"></i> All
        </button>
        <button class="cat-btn" *ngFor="let cat of categories" [class.active]="selectedCategory === cat" (click)="filterCategory(cat)">
          {{ categoryIcon(cat) }} {{ cat }}
        </button>
      </div>

      <!-- Info Bar -->
      <div class="info-bar" *ngIf="!loading">
        <span>{{ total }} products found</span>
        <span *ngIf="selectedCategory !== 'All'" class="active-filter">
          Showing: {{ selectedCategory }}
          <button (click)="filterCategory('All')"><i class="bi bi-x"></i></button>
        </span>
      </div>

      <!-- Loading -->
      <div class="spinner-wrapper" *ngIf="loading"><div class="spinner"></div></div>

      <!-- Products Grid -->
      <div class="products-grid fade-in-up" *ngIf="!loading">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-image" (click)="goToDetail(product._id)">
            <img [src]="product.image || ''" [alt]="product.name" (error)="onImgError($event)" />
            <div class="product-category-tag">{{ product.category }}</div>
            <div class="out-of-stock-overlay" *ngIf="product.stock === 0">
              <span>Out of Stock</span>
            </div>
          </div>
          <div class="product-info">
            <h3 (click)="goToDetail(product._id)">{{ product.name }}</h3>
            <p class="description">{{ product.description | slice:0:80 }}{{ product.description && product.description.length > 80 ? '...' : '' }}</p>
            <div class="price-row">
              <span class="price">Rs {{ product.price | number:'1.2-2' }}</span>
              <span class="stock" [class.low]="product.stock < 10 && product.stock > 0">
                {{ product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Only ' + product.stock + ' left' : 'In Stock' }}
              </span>
            </div>
            <div class="card-actions">
              <button class="btn-detail" (click)="goToDetail(product._id)">
                <i class="bi bi-eye"></i> Details
              </button>
              <button class="btn-cart" [class.in-cart]="cart.isInCart(product._id)"
                [disabled]="product.stock === 0" (click)="addToCart(product)">
                <i [class]="cart.isInCart(product._id) ? 'bi bi-check' : 'bi bi-bag-plus'"></i>
                {{ cart.isInCart(product._id) ? 'Added' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && products.length === 0">
        <i class="bi bi-search"></i>
        <h4>No products found</h4>
        <p>Try a different search or category</p>
        <button class="btn-primary-custom" (click)="clearFilters()">Clear Filters</button>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">
          <i class="bi bi-chevron-left"></i> Prev
        </button>
        <div class="page-nums">
          <button *ngFor="let p of pageNumbers" [class.active]="p === currentPage" (click)="changePage(p)">{{ p }}</button>
        </div>
        <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .hero-banner { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 48px 24px; text-align: center; }
    .hero-content { max-width: 600px; margin: 0 auto; }
    .hero-content h1 { color: white; font-size: 2rem; margin-bottom: 8px; font-family: 'Poppins',sans-serif; }
    .hero-content p { color: rgba(255,255,255,0.7); margin-bottom: 24px; }
    .search-bar { position: relative; max-width: 480px; margin: 0 auto; background: white; border-radius: 50px; display: flex; align-items: center; padding: 4px 12px 4px 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      i.bi-search { color: #9ca3af; flex-shrink: 0; }
      input { flex: 1; border: none; padding: 12px 12px; font-size: 0.95rem; outline: none; background: transparent; color: #1a1a2e; }
      .clear-btn { background: #f3f4f6; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    }
    .category-filter { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px;
      &::-webkit-scrollbar { height: 3px; }
      &::-webkit-scrollbar-thumb { background: #2ecc71; border-radius: 2px; }
    }
    .cat-btn { padding: 8px 16px; border: 2px solid #e0e0e0; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: white; cursor: pointer; white-space: nowrap; transition: all 0.2s; color: #374151;
      &:hover { border-color: #2ecc71; color: #2ecc71; }
      &.active { background: #2ecc71; border-color: #2ecc71; color: white; }
    }
    .info-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; color: #6c757d; font-size: 0.88rem; flex-wrap: wrap; gap: 8px; }
    .active-filter { display: flex; align-items: center; gap: 6px; background: #f0fdf4; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-weight: 600; button { background: none; border: none; cursor: pointer; color: #16a34a; display: flex; align-items: center; padding: 0; } }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-bottom: 28px; }
    .product-card { background: white; border-radius: 14px; border: 1px solid #e8f5e9; box-shadow: 0 2px 8px rgba(46,204,113,0.08); overflow: hidden; transition: all 0.3s;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
    }
    .product-image { position: relative; height: 180px; cursor: pointer; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
      &:hover img { transform: scale(1.05); }
    }
    .product-category-tag { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 3px 10px; border-radius: 10px; font-size: 0.72rem; font-weight: 600; backdrop-filter: blur(4px); }
    .out-of-stock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; span { background: #e74c3c; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; } }
    .product-info { padding: 16px; }
    .product-info h3 { font-size: 1rem; color: #1a1a2e; margin-bottom: 6px; cursor: pointer; line-height: 1.3; &:hover { color: #2ecc71; } }
    .description { color: #9ca3af; font-size: 0.82rem; margin-bottom: 10px; line-height: 1.5; min-height: 36px; }
    .price-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .price { font-size: 1.15rem; font-weight: 700; color: #2ecc71; }
    .stock { font-size: 0.78rem; font-weight: 600; color: #16a34a; &.low { color: #f59e0b; } }
    .card-actions { display: flex; gap: 8px; }
    .btn-detail { flex: 0 0 auto; background: #f8fffe; border: 2px solid #e8f5e9; color: #2ecc71; padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; &:hover { background: #f0fdf4; border-color: #2ecc71; } }
    .btn-cart { flex: 1; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,204,113,0.4); }
      &.in-cart { background: linear-gradient(135deg, #16a34a, #15803d); }
      &:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }
    }
    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px solid #e8f5e9; i { font-size: 3.5rem; color: #86efac; display: block; margin-bottom: 16px; } h4 { color: #1a1a2e; margin-bottom: 8px; } p { color: #9ca3af; margin-bottom: 20px; } }
    .btn-primary-custom { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 24px; flex-wrap: wrap; button { background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 8px 14px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; display: flex; align-items: center; gap: 4px; &:hover:not(:disabled) { border-color: #2ecc71; color: #2ecc71; } &.active { background: #2ecc71; border-color: #2ecc71; color: white; } &:disabled { opacity: 0.4; cursor: not-allowed; } } }
    .page-nums { display: flex; gap: 6px; }
    .toast-notification { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #1a1a2e; border-left: 4px solid #2ecc71; color: white; padding: 14px 20px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); font-weight: 500; display: flex; align-items: center; gap: 10px; animation: fadeInUp 0.3s ease; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];
    categories = PRODUCT_CATEGORIES;
    selectedCategory = 'All';
    searchQuery = '';
    loading = true;
    total = 0;
    currentPage = 1;
    totalPages = 1;
    toast: string | null = null;
    private searchTimer: any;

    constructor(
        public cart: CartService,
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    get pageNumbers(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    loadProducts(): void {
        this.loading = true;
        this.productService.getProducts({
            category: this.selectedCategory,
            search: this.searchQuery,
            page: this.currentPage,
            limit: 12,
        }).subscribe({
            next: (res) => {
                this.products = res.products;
                this.total = res.total || 0;
                this.totalPages = res.totalPages || 1;
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    filterCategory(cat: string): void {
        this.selectedCategory = cat;
        this.currentPage = 1;
        this.loadProducts();
    }

    onSearch(): void {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
            this.currentPage = 1;
            this.loadProducts();
        }, 400);
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.loadProducts();
    }

    clearFilters(): void {
        this.selectedCategory = 'All';
        this.searchQuery = '';
        this.loadProducts();
    }

    changePage(page: number): void {
        this.currentPage = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    addToCart(product: Product): void {
        this.cart.addToCart(product);
        this.showToast(`${product.name} added to cart!`);
    }

    goToDetail(id: string): void {
        this.router.navigate(['/customer/products', id]);
    }

    showToast(msg: string): void {
        this.toast = msg;
        setTimeout(() => (this.toast = null), 3000);
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI0MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2QxZDVkYiI+8J+SnTwvdGV4dD48L3N2Zz4=';
    }

    categoryIcon(cat: string): string {
        const icons: Record<string, string> = {
            'Fruits & Vegetables': '🥦', 'Dairy & Eggs': '🥛', 'Meat & Seafood': '🥩',
            'Bakery': '🍞', 'Beverages': '🧃', 'Snacks': '🍿', 'Frozen Foods': '🧊',
            'Pantry': '🫙', 'Personal Care': '🧴', 'Household': '🧹', 'Other': '📦',
        };
        return icons[cat] || '📦';
    }
}
