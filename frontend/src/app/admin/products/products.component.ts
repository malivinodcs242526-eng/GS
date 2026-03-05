import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { Product, PRODUCT_CATEGORIES } from '../../models/product.model';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
    template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1><i class="bi bi-box-seam"></i> Product Management</h1>
          <p>Manage your grocery store inventory</p>
        </div>
        <button class="btn-add" (click)="openModal()">
          <i class="bi bi-plus-circle"></i> Add Product
        </button>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="toast-notification" [class]="toast.type">
        <i [class]="toast.type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'"></i>
        {{ toast.message }}
      </div>

      <!-- Products Table -->
      <div class="table-card fade-in-up">
        <div class="table-header">
          <span class="count">{{ products.length }} products</span>
          <div class="filter-group">
            <select class="filter-select" (change)="filterByCategory($event)">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
        </div>

        <div class="spinner-wrapper" *ngIf="loading"><div class="spinner"></div></div>

        <div *ngIf="!loading && products.length === 0" class="empty-state">
          <i class="bi bi-box-seam"></i>
          <h4>No products yet</h4>
          <p>Click "Add Product" to add your first product</p>
        </div>

        <div class="table-wrapper" *ngIf="!loading && products.length > 0">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of filteredProducts">
                <td>
                  <div class="product-cell">
                    <img [src]="product.image || 'assets/placeholder.png'" [alt]="product.name" class="product-thumb" (error)="onImgError($event)" />
                    <div>
                      <strong>{{ product.name }}</strong>
                      <small>{{ product.description | slice:0:50 }}{{ product.description && product.description.length > 50 ? '...' : '' }}</small>
                    </div>
                  </div>
                </td>
                <td><span class="category-badge">{{ product.category }}</span></td>
                <td><strong class="price">Rs {{ product.price | number:'1.2-2' }}</strong></td>
                <td>
                  <span [class]="product.stock === 0 ? 'stock-empty' : product.stock < 10 ? 'stock-low' : 'stock-ok'">
                    {{ product.stock }} units
                  </span>
                </td>
                <td>
                  <span [class]="product.isActive ? 'badge-active' : 'badge-inactive'">
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-edit" (click)="editProduct(product)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-delete" (click)="deleteProduct(product._id)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Overlay -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()"></div>

    <!-- Product Modal -->
    <div class="modal-panel" *ngIf="showModal">
      <div class="modal-header">
        <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
        <button class="close-btn" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Product Name *</label>
            <input type="text" formControlName="name" class="form-control-custom"
              [class.is-invalid]="submitted && f['name'].errors" placeholder="e.g. Fresh Apples" />
            <small *ngIf="submitted && f['name'].errors?.['required']" class="error-text">Name is required</small>
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select formControlName="category" class="form-control-custom" [class.is-invalid]="submitted && f['category'].errors">
              <option value="">Select category</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
            <small *ngIf="submitted && f['category'].errors?.['required']" class="error-text">Category is required</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Price (Rs) *</label>
            <input type="number" formControlName="price" class="form-control-custom"
              [class.is-invalid]="submitted && f['price'].errors" min="0" step="0.01" placeholder="0.00" />
            <small *ngIf="submitted && f['price'].errors?.['required']" class="error-text">Price is required</small>
          </div>
          <div class="form-group">
            <label>Stock Quantity *</label>
            <input type="number" formControlName="stock" class="form-control-custom"
              [class.is-invalid]="submitted && f['stock'].errors" min="0" placeholder="0" />
            <small *ngIf="submitted && f['stock'].errors?.['required']" class="error-text">Stock is required</small>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea formControlName="description" class="form-control-custom" rows="3"
            placeholder="Enter product description..."></textarea>
        </div>

        <div class="form-group">
          <label>Product Image</label>
          <div class="image-upload-area" (click)="fileInput.click()">
            <img *ngIf="imagePreview" [src]="imagePreview" class="image-preview" alt="preview" />
            <div *ngIf="!imagePreview" class="upload-placeholder">
              <i class="bi bi-cloud-arrow-up"></i>
              <span>Click to upload image</span>
              <small>JPG, PNG, GIF up to 5MB</small>
            </div>
          </div>
          <input #fileInput type="file" accept="image/*" (change)="onFileChange($event)" style="display:none" />
        </div>

        <div class="form-group" *ngIf="editingProduct">
          <label class="toggle-label">
            <input type="checkbox" formControlName="isActive" />
            <span>Active (visible to customers)</span>
          </label>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" (click)="closeModal()">Cancel</button>
          <button type="submit" class="btn-save" [disabled]="saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-save" *ngIf="!saving"></i>
            {{ saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product') }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;
      h1 { font-size: 1.7rem; color: #1a1a2e; display: flex; align-items: center; gap: 10px; i { color: #2ecc71; } }
      p { color: #6c757d; margin-top: 4px; font-size: 0.9rem; }
    }
    .btn-add { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; padding: 11px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; gap: 8px;
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,204,113,0.4); }
    }
    .table-card { background: white; border-radius: 12px; border: 1px solid #e8f5e9; box-shadow: 0 2px 8px rgba(46,204,113,0.08); overflow: hidden; }
    .table-header { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; }
    .count { font-weight: 600; color: #374151; }
    .filter-select { padding: 8px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.88rem; background: white; cursor: pointer; &:focus { outline: none; border-color: #2ecc71; } }
    .table-wrapper { overflow-x: auto; }
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .product-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0; flex-shrink: 0; }
    .product-cell strong { display: block; font-size: 0.9rem; color: #1a1a2e; }
    .product-cell small { display: block; color: #9ca3af; font-size: 0.78rem; }
    .category-badge { background: #eff6ff; color: #3b82f6; padding: 3px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; }
    .price { color: #2ecc71; font-size: 0.95rem; }
    .stock-ok { color: #16a34a; font-weight: 600; font-size: 0.85rem; }
    .stock-low { color: #f59e0b; font-weight: 600; font-size: 0.85rem; }
    .stock-empty { color: #e74c3c; font-weight: 600; font-size: 0.85rem; }
    .badge-active { background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; }
    .badge-inactive { background: #f8d7da; color: #721c24; padding: 3px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; }
    .action-btns { display: flex; gap: 6px; }
    .btn-edit { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; &:hover { background: #3b82f6; color: white; } }
    .btn-delete { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; &:hover { background: #ef4444; color: white; } }
    .empty-state { text-align: center; padding: 60px 20px; i { font-size: 3.5rem; color: #86efac; display: block; margin-bottom: 12px; } h4 { color: #1a1a2e; } p { color: #9ca3af; font-size: 0.9rem; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; }
    .modal-panel { position: fixed; top: 0; right: 0; width: 520px; max-width: 100vw; height: 100vh; background: white; z-index: 2001; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; overflow-y: auto; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .modal-header { padding: 20px 24px; background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; display: flex; align-items: center; justify-content: space-between;
      h3 { font-size: 1.1rem; margin: 0; }
      .close-btn { background: rgba(255,255,255,0.1); border: none; color: white; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; &:hover { background: rgba(255,255,255,0.2); } }
    }
    .modal-body { padding: 24px; flex: 1; overflow-y: auto; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; label { display: block; font-weight: 600; font-size: 0.88rem; color: #374151; margin-bottom: 6px; } }
    .form-control-custom { width: 100%; padding: 11px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.92rem; transition: all 0.2s; font-family: 'Inter', sans-serif;
      &:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 0 3px rgba(46,204,113,0.15); }
      &.is-invalid { border-color: #e74c3c; }
    }
    textarea.form-control-custom { resize: vertical; }
    .error-text { color: #e74c3c; font-size: 0.78rem; display: block; margin-top: 3px; }
    .image-upload-area { border: 2px dashed #e0e0e0; border-radius: 10px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; min-height: 100px; display: flex; align-items: center; justify-content: center;
      &:hover { border-color: #2ecc71; background: #f0fdf4; }
    }
    .image-preview { max-width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover; }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #9ca3af; i { font-size: 2rem; } small { font-size: 0.78rem; color: #d1d5db; } }
    .toggle-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; color: #374151; input { width: 18px; height: 18px; accent-color: #2ecc71; } }
    .modal-footer { padding: 16px 24px; display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid #f0f0f0; }
    .btn-cancel { background: #f3f4f6; color: #374151; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; &:hover { background: #e5e7eb; } }
    .btn-save { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,204,113,0.4); }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
    .toast-notification { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 14px 20px; border-radius: 10px; color: white; font-weight: 500; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; animation: fadeInUp 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      &.success { background: #1a1a2e; border-left: 4px solid #2ecc71; }
      &.error { background: #1a1a2e; border-left: 4px solid #e74c3c; }
    }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class ProductsComponent implements OnInit {
    products: Product[] = [];
    filteredProducts: Product[] = [];
    categories = PRODUCT_CATEGORIES;
    loading = true;
    showModal = false;
    editingProduct: Product | null = null;
    productForm!: FormGroup;
    submitted = false;
    saving = false;
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    toast: { message: string; type: string } | null = null;

    constructor(private fb: FormBuilder, private productService: ProductService) { }

    ngOnInit(): void {
        this.loadProducts();
        this.initForm();
    }

    initForm(product?: Product): void {
        this.productForm = this.fb.group({
            name: [product?.name || '', Validators.required],
            category: [product?.category || '', Validators.required],
            price: [product?.price || '', [Validators.required, Validators.min(0)]],
            stock: [product?.stock ?? 0, [Validators.required, Validators.min(0)]],
            description: [product?.description || ''],
            isActive: [product?.isActive ?? true],
        });
    }

    get f() { return this.productForm.controls; }

    loadProducts(): void {
        this.loading = true;
        this.productService.getAllProductsAdmin().subscribe({
            next: (res) => {
                this.products = res.products;
                this.filteredProducts = res.products;
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    filterByCategory(event: Event): void {
        const category = (event.target as HTMLSelectElement).value;
        this.filteredProducts = category
            ? this.products.filter((p) => p.category === category)
            : this.products;
    }

    openModal(): void {
        this.editingProduct = null;
        this.imagePreview = null;
        this.selectedFile = null;
        this.submitted = false;
        this.initForm();
        this.showModal = true;
    }

    editProduct(product: Product): void {
        this.editingProduct = product;
        this.imagePreview = product.image || null;
        this.selectedFile = null;
        this.submitted = false;
        this.initForm(product);
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.editingProduct = null;
        this.imagePreview = null;
        this.selectedFile = null;
    }

    onFileChange(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => (this.imagePreview = e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPvCfkqE8L3RleHQ+PC9zdmc+';
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.productForm.invalid) return;

        this.saving = true;
        const formData = new FormData();
        Object.entries(this.productForm.value).forEach(([key, val]) => {
            formData.append(key, String(val));
        });
        if (this.selectedFile) formData.append('image', this.selectedFile);

        const request = this.editingProduct
            ? this.productService.updateProduct(this.editingProduct._id, formData)
            : this.productService.createProduct(formData);

        request.subscribe({
            next: (res) => {
                this.showToast(res.message, 'success');
                this.closeModal();
                this.loadProducts();
                this.saving = false;
            },
            error: (err) => {
                this.showToast(err.error?.message || 'Something went wrong', 'error');
                this.saving = false;
            },
        });
    }

    deleteProduct(id: string): void {
        if (!confirm('Are you sure you want to delete this product?')) return;
        this.productService.deleteProduct(id).subscribe({
            next: (res) => {
                this.showToast(res.message, 'success');
                this.loadProducts();
            },
            error: (err) => this.showToast(err.error?.message || 'Delete failed', 'error'),
        });
    }

    showToast(message: string, type: 'success' | 'error'): void {
        this.toast = { message, type };
        setTimeout(() => (this.toast = null), 3500);
    }
}
