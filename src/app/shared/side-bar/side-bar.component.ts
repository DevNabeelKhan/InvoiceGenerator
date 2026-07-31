import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { StorageService } from '../../../services/local-storage.service';
import { AlertService } from '../../../services/alert.service';
import { CONFIGURATION_TYPES } from '../models/configuration.model';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {

  sidebarOpen = true;
  configOpen = false;
  user: any = {};
  configurationTypes = CONFIGURATION_TYPES;

  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleConfigMenu() {
    this.configOpen = !this.configOpen;
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
