import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryCustomerMappingApiService {

  controller: string = 'BeneficiaryCustomerMapping';

  constructor(readonly httpService: HttpService, readonly alert: AlertService) { }

  async GetBeneficiariesByCustomer(customerId: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetBeneficiariesByCustomer`, { customerId });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async GetCustomersByBeneficiary(beneficiaryId: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetCustomersByBeneficiary`, { beneficiaryId });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async SaveCustomerBeneficiaries(customerId: number, beneficiaryIds: number[]): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/SaveCustomerBeneficiaries`, { CustomerId: customerId, BeneficiaryIds: beneficiaryIds });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async SaveBeneficiaryCustomers(beneficiaryId: number, customerIds: number[]): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/SaveBeneficiaryCustomers`, { BeneficiaryId: beneficiaryId, CustomerIds: customerIds });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }
}
