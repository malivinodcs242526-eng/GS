import { Routes } from '@angular/router';
import { authGuard, adminGuard, customerGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
    {
        path: 'auth',
        canActivate: [guestGuard],
        children: [
            {
                path: 'login',
                loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
            },
            {
                path: 'register',
                loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent),
            },
        ],
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
            },
            {
                path: 'products',
                loadComponent: () => import('./admin/products/products.component').then((m) => m.ProductsComponent),
            },
            {
                path: 'orders',
                loadComponent: () => import('./admin/orders/orders.component').then((m) => m.OrdersComponent),
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    {
        path: 'customer',
        canActivate: [customerGuard],
        children: [
            {
                path: 'products',
                loadComponent: () => import('./customer/product-list/product-list.component').then((m) => m.ProductListComponent),
            },
            {
                path: 'products/:id',
                loadComponent: () => import('./customer/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
            },
            {
                path: 'cart',
                loadComponent: () => import('./customer/cart/cart.component').then((m) => m.CartComponent),
            },
            {
                path: 'orders',
                loadComponent: () => import('./customer/orders/orders.component').then((m) => m.CustomerOrdersComponent),
            },
            { path: '', redirectTo: 'products', pathMatch: 'full' },
        ],
    },
    {
        path: '**',
        redirectTo: 'auth/login',
    },
];
