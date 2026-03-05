import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
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
          <h1>Join Our<br />Community</h1>
          <p>Create an account and start shopping for fresh groceries today!</p>
          <div class="steps">
            <div class="step"><span class="step-num">1</span> Create your account</div>
            <div class="step"><span class="step-num">2</span> Browse products</div>
            <div class="step"><span class="step-num">3</span> Place your order</div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <h2>Create Account</h2>
          <p class="subtitle">Join thousands of happy customers</p>

          <div class="alert-custom alert-danger" *ngIf="errorMsg">
            <i class="bi bi-exclamation-triangle"></i> {{ errorMsg }}
          </div>
          <div class="alert-custom alert-success" *ngIf="successMsg">
            <i class="bi bi-check-circle"></i> {{ successMsg }}
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <div class="input-icon">
                  <i class="bi bi-person"></i>
                  <input type="text" formControlName="name" class="form-control-custom"
                    [class.is-invalid]="submitted && f['name'].errors"
                    placeholder="John Doe" />
                </div>
                <small class="error-text" *ngIf="submitted && f['name'].errors?.['required']">Name is required</small>
                <small class="error-text" *ngIf="submitted && f['name'].errors?.['minlength']">Min 2 characters</small>
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <div class="input-icon">
                  <i class="bi bi-telephone"></i>
                  <input type="tel" formControlName="phone" class="form-control-custom" placeholder="+92 300 0000000" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Email Address *</label>
              <div class="input-icon">
                <i class="bi bi-envelope"></i>
                <input type="email" formControlName="email" class="form-control-custom"
                  [class.is-invalid]="submitted && f['email'].errors"
                  placeholder="john@example.com" />
              </div>
              <small class="error-text" *ngIf="submitted && f['email'].errors?.['required']">Email is required</small>
              <small class="error-text" *ngIf="submitted && f['email'].errors?.['email']">Enter a valid email</small>
            </div>

            <div class="form-group">
              <label>Delivery Address</label>
              <div class="input-icon">
                <i class="bi bi-geo-alt"></i>
                <input type="text" formControlName="address" class="form-control-custom" placeholder="123 Main St, City" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Password *</label>
                <div class="input-icon">
                  <i class="bi bi-lock"></i>
                  <input [type]="showPassword ? 'text' : 'password'" formControlName="password"
                    class="form-control-custom"
                    [class.is-invalid]="submitted && f['password'].errors"
                    placeholder="Min 6 characters" />
                  <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                    <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <small class="error-text" *ngIf="submitted && f['password'].errors?.['required']">Password is required</small>
                <small class="error-text" *ngIf="submitted && f['password'].errors?.['minlength']">Min 6 characters</small>
              </div>

              <div class="form-group">
                <label>Confirm Password *</label>
                <div class="input-icon">
                  <i class="bi bi-lock-fill"></i>
                  <input [type]="showPassword ? 'text' : 'password'" formControlName="confirmPassword"
                    class="form-control-custom"
                    [class.is-invalid]="submitted && f['confirmPassword'].errors"
                    placeholder="Repeat password" />
                </div>
                <small class="error-text" *ngIf="submitted && registerForm.errors?.['mismatch']">Passwords do not match</small>
              </div>
            </div>

            <button type="submit" class="btn-primary-custom w-100" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-person-plus" *ngIf="!loading"></i>
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="login-link">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-wrapper { display: flex; min-height: 100vh; }
    .auth-left { flex: 1; background: linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); display: flex; align-items: center; justify-content: center; padding: 48px; }
    .hero-content { color: white; max-width: 400px; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; i { font-size: 2.5rem; color: #2ecc71; } span { font-size: 1.8rem; font-weight: 700; font-family: 'Poppins', sans-serif; } }
    h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 16px; font-family: 'Poppins', sans-serif; }
    p { color: rgba(255,255,255,0.7); margin-bottom: 32px; font-size: 1.05rem; }
    .steps { display: flex; flex-direction: column; gap: 16px; }
    .step { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.9); }
    .step-num { width: 28px; height: 28px; background: #2ecc71; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .auth-right { flex: 0 0 560px; display: flex; align-items: center; justify-content: center; padding: 40px; background: #f8fffe; overflow-y: auto; }
    .auth-card { width: 100%; max-width: 480px; h2 { font-size: 1.8rem; color: #1a1a2e; margin-bottom: 8px; } .subtitle { color: #6c757d; margin-bottom: 20px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 14px; label { display: block; font-weight: 600; font-size: 0.88rem; color: #374151; margin-bottom: 5px; } }
    .input-icon { position: relative; i.bi-person, i.bi-envelope, i.bi-lock, i.bi-lock-fill, i.bi-telephone, i.bi-geo-alt { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; } input { padding-left: 40px; } .toggle-pw { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; } }
    .form-control-custom { width: 100%; padding: 11px 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.92rem; transition: all 0.3s; background: white; color: #1a1a2e; &:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 0 3px rgba(46,204,113,0.15); } &.is-invalid { border-color: #e74c3c; } }
    .error-text { color: #e74c3c; font-size: 0.78rem; margin-top: 3px; display: block; }
    .btn-primary-custom { background: linear-gradient(135deg,#2ecc71,#27ae60); color: white; border: none; width: 100%; padding: 13px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,204,113,0.4); } &:disabled { opacity: 0.7; cursor: not-allowed; } }
    .alert-custom { padding: 11px 14px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .alert-danger { background: #fdecea; color: #721c24; border: 1px solid #f5c6cb; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .login-link { text-align: center; margin-top: 16px; color: #6c757d; font-size: 0.9rem; a { color: #2ecc71; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } } }
    @media (max-width: 768px) { .auth-left { display: none; } .auth-right { flex: 1; padding: 24px; } .form-row { grid-template-columns: 1fr; } }
  `],
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    errorMsg = '';
    successMsg = '';
    showPassword = false;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
        this.registerForm = this.fb.group(
            {
                name: ['', [Validators.required, Validators.minLength(2)]],
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', Validators.required],
                phone: [''],
                address: [''],
            },
            { validators: this.passwordMatch }
        );
    }

    get f() { return this.registerForm.controls; }

    passwordMatch(group: FormGroup) {
        const pass = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { mismatch: true };
    }

    onSubmit(): void {
        this.submitted = true;
        this.errorMsg = '';
        if (this.registerForm.invalid) return;

        this.loading = true;
        const { confirmPassword, ...data } = this.registerForm.value;

        this.auth.register(data).subscribe({
            next: () => {
                this.router.navigate(['/customer/products']);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Registration failed.';
                this.loading = false;
            },
        });
    }
}
