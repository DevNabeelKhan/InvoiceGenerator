import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';
import { Product } from '../app/shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {

  controller: string = 'Product';

  constructor(readonly httpService: HttpService, readonly alert: AlertService) { }

  async GetProduct(params: { Id?: number | null; SearchText?: string | null; IsActive?: boolean | null; PageNumber?: number; PageSize?: number; }): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetProduct`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateProduct(body: Product): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateProduct`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteProduct(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteProduct`, { Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }
}
