import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn) {
        return true;
    }

    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn && auth.isAdmin) {
        return true;
    }

    if (auth.isLoggedIn && !auth.isAdmin) {
        router.navigate(['/customer/products']);
        return false;
    }

    router.navigate(['/auth/login']);
    return false;
};

export const customerGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn && auth.isCustomer) {
        return true;
    }

    if (auth.isLoggedIn && !auth.isCustomer) {
        router.navigate(['/admin/dashboard']);
        return false;
    }

    router.navigate(['/auth/login']);
    return false;
};

export const guestGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn) {
        return true;
    }

    if (auth.isAdmin) {
        router.navigate(['/admin/dashboard']);
    } else {
        router.navigate(['/customer/products']);
    }
    return false;
};
