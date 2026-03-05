import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    createOrder(orderData: {
        products: { product: string; quantity: number }[];
        shippingAddress: string;
        paymentMethod: string;
        notes?: string;
    }): Observable<{ success: boolean; order: Order; message: string }> {
        return this.http.post<any>(this.apiUrl, orderData);
    }

    getMyOrders(): Observable<{ success: boolean; orders: Order[] }> {
        return this.http.get<any>(`${this.apiUrl}/my-orders`);
    }

    getAllOrders(filters?: { status?: string; page?: number; limit?: number }): Observable<{
        success: boolean;
        orders: Order[];
        total: number;
        totalPages: number;
    }> {
        let params = new HttpParams();
        if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
        if (filters?.page) params = params.set('page', filters.page.toString());
        if (filters?.limit) params = params.set('limit', filters.limit.toString());
        return this.http.get<any>(this.apiUrl, { params });
    }

    updateOrderStatus(id: string, status: string): Observable<{ success: boolean; order: Order; message: string }> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, { status });
    }

    getOrderById(id: string): Observable<{ success: boolean; order: Order }> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }
}
