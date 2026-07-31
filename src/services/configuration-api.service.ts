import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';
import { EncryptionService } from './encryption.service';
import { ConfigurationItem } from '../app/shared/models/configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationApiService {

  controller: string = 'Configuration';

  constructor(readonly httpService: HttpService, readonly alert: AlertService, readonly encryption: EncryptionService) { }

  async GetConfiguration(tableName: string, params: { Id?: number | null; SearchText?: string | null; IsActive?: boolean | null; PageNumber?: number; PageSize?: number; }): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetConfiguration`, { TableName: this.encryption.encrypt(tableName), ...params });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateConfiguration(tableName: string, body: ConfigurationItem): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateConfiguration`, { TableName: this.encryption.encrypt(tableName), ...body });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteConfiguration(tableName: string, Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteConfiguration`, { TableName: this.encryption.encrypt(tableName), Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }
}
