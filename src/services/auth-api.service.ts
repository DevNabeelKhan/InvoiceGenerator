import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { StorageService } from './local-storage.service';
import { AlertService } from './alert.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  constructor(readonly httpService: HttpService, readonly alert: AlertService,readonly storage: StorageService) { }

  controller: string = "Auth";
  private setHeaders(): HttpHeaders {
    var token = this.storage.getItem("Token");
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  async login(body: any): Promise<any | undefined> {
 
    try {
      return await this.httpService.post<any>(`${this.controller}/login`, body)
    }
    catch (err: any) { 
       this.alert.Error(err.statusText);
    }
    return undefined;
  }
  
  async getRoles(): Promise<any | undefined> {

    try {
      return await this.httpService.get<any>(`${this.controller}/Roles`)
    }
    catch (err: any) {
      this.alert.Error(err.statusText);
    }
    return undefined;
  }
}
