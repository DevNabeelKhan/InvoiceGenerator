import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../../services/local-storage.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {

  sidebarOpen = true;
  user: any = {};

  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  constructor( 
    readonly storage: StorageService,
    readonly router: Router,
    readonly alert: AlertService,) { 
      this.user = this.storage.getItem('User');
      this.sidebarOpen = window.innerWidth >= 992;
     }
    
  logout() {
    this.storage.removeItem('Token');
    this.storage.removeItem('User');
    location.href = "/#/login";
    location.reload();
    this.alert.Success("LogOut");
  }
}
