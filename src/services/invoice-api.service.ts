import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';
import { Invoice, Company, Currency } from '../app/shared/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceApiService {

  controller: string = 'Invoice';

  constructor(readonly httpService: HttpService, readonly alert: AlertService) { }

  async GetInvoice(params: { Id?: number | null; SearchText?: string | null; CustomerId?: number | null; Status?: string | null; IsActive?: boolean | null; PageNumber?: number; PageSize?: number; }): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetInvoice`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateInvoice(body: Invoice): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateInvoice`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteInvoice(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteInvoice`, { Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async GetCompany(Id?: number | null): Promise<any> {
    try {
      const params = Id != null ? { Id } : {};
      return await this.httpService.getAsync<any>(`${this.controller}/GetCompany`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateCompany(body: Company): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateCompany`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async GetCurrency(Id?: number | null): Promise<any> {
    try {
      const params = Id != null ? { Id } : {};
      return await this.httpService.getAsync<any>(`${this.controller}/GetCurrency`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateCurrency(body: Currency): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateCurrency`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async GenerateQr(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GenerateQr`, { Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  getDownloadPdfUrl(Id: number): string {
    return `${(this.httpService as any).baseUrl}/${this.controller}/DownloadPdf?Id=${Id}`;
  }

  getGenerateXmlUrl(Id: number): string {
    return `${(this.httpService as any).baseUrl}/${this.controller}/GenerateXml?Id=${Id}`;
  }
}
