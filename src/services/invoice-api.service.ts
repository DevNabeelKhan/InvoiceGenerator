import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertService } from './alert.service';
import { Invoice, Company, Currency, Project } from '../app/shared/models/invoice.model';

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

  async InsertUpdateCompany(body: Company, attachLogo?: File | null): Promise<any> {
    try {
      const formData = new FormData();

      Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as any);
        }
      });

      if (attachLogo) {
        formData.append('attachLogo', attachLogo, attachLogo.name);
      }

      return await this.httpService.postFormData<any>(`${this.controller}/InsertUpdateCompany`, formData);
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

  async GetProject(params: { Id?: number | null; SearchText?: string | null; IsActive?: boolean | null; PageNumber?: number; PageSize?: number; }): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetProject`, params);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async InsertUpdateProject(body: Project): Promise<any> {
    try {
      return await this.httpService.post<any>(`${this.controller}/InsertUpdateProject`, body);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteProject(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteProject`, { Id });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async GetProjectDocument(ProjectId: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/GetProjectDocument`, { ProjectId });
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async UploadProjectDocument(ProjectId: number, file: File, DocumentTitle?: string | null): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('ProjectId', String(ProjectId));
      if (DocumentTitle) formData.append('DocumentTitle', DocumentTitle);
      formData.append('file', file, file.name);
      return await this.httpService.postFormData<any>(`${this.controller}/UploadProjectDocument`, formData);
    } catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }

  async DeleteProjectDocument(Id: number): Promise<any> {
    try {
      return await this.httpService.getAsync<any>(`${this.controller}/DeleteProjectDocument`, { Id });
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
