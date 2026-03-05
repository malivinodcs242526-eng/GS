import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="hero-content">
          <div class="logo">
            <i class="bi bi-cart3"></i>
            <span>GroceryMart</span>
          </div>
          <h1>Fresh Groceries,<br />Delivered Fast</h1>
          <p>Shop from our wide selection of fresh fruits, vegetables, dairy, and more.</p>
          <div class="features">
            <div class="feature"><i class="bi bi-check-circle-fill"></i> Fast Delivery</div>
            <div class="feature"><i class="bi bi-check-circle-fill"></i> Fresh Products</div>
            <div class="feature"><i class="bi bi-check-circle-fill"></i> Best Prices</div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <h2>Welcome Back</h2>
          <p class="subtitle">Sign in to your account</p>

          <div class="alert-custom alert-danger" *ngIf="errorMsg">
            <i class="bi bi-exclamation-triangle"></i> {{ errorMsg }}
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-icon">
                <i class="bi bi-envelope"></i>
                <input
                  type="email"
                  formControlName="email"
                  class="form-control-custom"
                  [class.is-invalid]="submitted && f['email'].errors"
                  placeholder="Enter your email"
                />
              </div>
              <small class="error-text" *ngIf="submitted && f['email'].errors?.['required']">Email is required</small>
              <small class="error-text" *ngIf="submitted && f['email'].errors?.['email']">Enter a valid email</small>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-icon">
                <i class="bi bi-lock"></i>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="form-control-custom"
                  [class.is-invalid]="submitted && f['password'].errors"
                  placeholder="Enter your password"
                />
                <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <small class="error-text" *ngIf="submitted && f['password'].errors?.['required']">Password is required</small>
            </div>

            <button type="submit" class="btn-primary-custom w-100" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-box-arrow-in-right" *ngIf="!loading"></i>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="register-link">
            Don't have an account?
            <a routerLink="/auth/register">Create account</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }
    .hero-content {
      color: white;
      max-width: 400px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
      i { font-size: 2.5rem; color: #2ecc71; }
      span { font-size: 1.8rem; font-weight: 700; font-family: 'Poppins', sans-serif; }
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 16px;
      font-family: 'Poppins', sans-serif;
    }
    p { color: rgba(255,255,255,0.7); margin-bottom: 32px; font-size: 1.05rem; }
    .features {
      display: flex;
      flex-direction: column;
      gap: 12px;
      .feature {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255,255,255,0.9);
        i { color: #2ecc71; }
      }
    }
    .auth-right {
      flex: 0 0 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: #f8fffe;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      h2 { font-size: 1.8rem; color: #1a1a2e; margin-bottom: 8px; }
      .subtitle { color: #6c757d; margin-bottom: 24px; }
    }
    .form-group {
      margin-bottom: 16px;
      label { display: block; font-weight: 600; font-size: 0.9rem; color: #374151; margin-bottom: 6px; }
    }
    .input-icon {
      position: relative;
      i.bi-envelope, i.bi-lock { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
      input { padding-left: 40px; }
      .toggle-pw {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #9ca3af;
        &:hover { color: #374151; }
      }
    }
    .form-control-custom { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; transition: all 0.3s; background: white; color: #1a1a2e;
      &:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 0 3px rgba(46,204,113,0.15); }
      &.is-invalid { border-color: #e74c3c; }
    }
    .error-text { color: #e74c3c; font-size: 0.78rem; margin-top: 4px; display: block; }
    .btn-primary-custom { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; width: 100%; padding: 13px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px;
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,204,113,0.4); }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
    .alert-custom { padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .alert-danger { background: #fdecea; color: #721c24; border: 1px solid #f5c6cb; }
    .register-link { text-align: center; margin-top: 20px; color: #6c757d; font-size: 0.9rem;
      a { color: #2ecc71; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
    }
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { flex: 1; padding: 24px; }
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMsg = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMsg = '';
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.user.role === 'admin') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/customer/products']);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
