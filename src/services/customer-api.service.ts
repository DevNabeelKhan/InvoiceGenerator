import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';
import { Customer } from '../app/shared/models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerApiService {

  controller: string = 'Customer';

  constructor(readonly httpService: HttpService, readonly alert: AlertService) { }

  async GetCustomer(params: { Id?: number | null; SearchText?: string | null; IsActive?: boolean | null; PageNumber?: number; PageSize?: number; }): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetCustomer`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateCustomer(body: Customer): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateCustomer`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteCustomer(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteCustomer`, { Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }
}
