import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';
import { Beneficiary } from '../app/shared/models/beneficiary.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryApiService {

  controller: string = 'Beneficiary';

  constructor(readonly httpService: HttpService, readonly alert: AlertService) { }

  async GetBeneficiary(params: { Id?: number | null; SearchText?: string | null; IsActive?: boolean | null; PageNumber?: number; PageSize?: number; }): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetBeneficiary`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateBeneficiary(body: Beneficiary): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateBeneficiary`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteBeneficiary(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteBeneficiary`, { Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }
}
