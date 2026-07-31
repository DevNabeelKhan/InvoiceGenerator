import { StorageService } from './local-storage.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, firstValueFrom } from 'rxjs'; 
import { AlertService } from './alert.service';  
import { query } from '@angular/animations'; 
import { environment } from '../../environments/environtment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = environment.apiUrl;
  user:any = {};
  constructor(private http: HttpClient, readonly alert: AlertService, readonly storage: StorageService) { 
    this.user = this.storage.getItem("User");
  }

  private setFormDataHeaders(): HttpHeaders {
    var token = this.storage.getItem("Token");
    return new HttpHeaders({  
      'Authorization': `Bearer ${token}`
    });
  }

  private setHeaders(): HttpHeaders {
    var token = this.storage.getItem("Token");
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: any) {  
    if(error.status == 401){
      localStorage.clear(); 
      location.href = "/#/login";
      location.reload();
    }
    return throwError(() => error);
  }

  get<T>(endpoint: string, queryParams?: any): Observable<T> {
    let customHeaders = this.setHeaders();
    const options = {  params: queryParams,headers:customHeaders };
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options); 
    } 
  async getAsync<T>(endpoint: string, queryParams?: any): Promise<T> {
     let customHeaders = this.setHeaders(); 
    const options = {  params: queryParams ,headers:customHeaders}; 
    const observable = this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
    return await firstValueFrom(observable.pipe(catchError(this.handleError)));
  }


  async post<T>(endpoint: string, data: any,QueryParam:any= null): Promise<T> {
     let customHeaders = this.setHeaders();
    const options = { params:QueryParam ,headers:customHeaders }; 
    const observable = this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, options);
    return await firstValueFrom(observable.pipe(catchError(this.handleError)));
  }
  async postFormData<T>(endpoint: string, data: FormData): Promise<T> {
    let customHeaders = this.setFormDataHeaders();
     const options = {  headers:customHeaders,  };  
        const observable = this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, options);
    return await firstValueFrom(observable.pipe(catchError(this.handleError)));
   }

  async put<T>(endpoint: string, data: any): Promise<T> {
    let customHeaders = this.setHeaders();
    const options = {  headers:customHeaders  }; 
    const observable = this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, options);
    return await firstValueFrom(observable.pipe(catchError(this.handleError)));
  }

  async delete<T>(endpoint: string,queryParams:any): Promise<T> {
    let customHeaders = this.setHeaders();
    const options = {  headers:customHeaders  }; 

    const observable = this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options);
    return await firstValueFrom(observable.pipe(catchError(this.handleError)));
  }
}
