import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getProducts(filters?: { category?: string; search?: string; page?: number; limit?: number }): Observable<ProductResponse> {
        let params = new HttpParams();
        if (filters?.category && filters.category !== 'All') params = params.set('category', filters.category);
        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.page) params = params.set('page', filters.page.toString());
        if (filters?.limit) params = params.set('limit', filters.limit.toString());
        return this.http.get<ProductResponse>(this.apiUrl, { params });
    }

    getProductById(id: string): Observable<{ success: boolean; product: Product }> {
        return this.http.get<{ success: boolean; product: Product }>(`${this.apiUrl}/${id}`);
    }

    getAllProductsAdmin(): Observable<{ success: boolean; products: Product[] }> {
        return this.http.get<{ success: boolean; products: Product[] }>(`${this.apiUrl}/admin/all`);
    }

    createProduct(formData: FormData): Observable<{ success: boolean; product: Product; message: string }> {
        return this.http.post<{ success: boolean; product: Product; message: string }>(this.apiUrl, formData);
    }

    updateProduct(id: string, formData: FormData): Observable<{ success: boolean; product: Product; message: string }> {
        return this.http.put<{ success: boolean; product: Product; message: string }>(`${this.apiUrl}/${id}`, formData);
    }

    deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
    }
}
