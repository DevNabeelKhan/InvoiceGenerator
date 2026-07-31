import { Injectable } from '@angular/core';
import { StorageService } from '../../services/local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private storage: StorageService) {}

  isLoggedIn(): boolean {
    return !!this.storage.getItem('User'); 
  }
}
