import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { SideBarComponent } from '../shared/side-bar/side-bar.component';
import { StorageService } from '../../services/local-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet,HeaderComponent,SideBarComponent,RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
user:any = {};
  constructor(private store:StorageService,private router:Router,private toastr:ToastrService){
    this.user = store.getItem("User");
}
ChangePassword() {
  this.router.navigate(['/change-password']); 
  this.closePopup();
}
closePopup() {
  const button = document.getElementById('closerightpopup');
  button?.click();
}
Logout() {
  this.store.removeItem('Token');
  this.store.removeItem('User');
  location.href = "/#/login";
  location.reload();
  this.toastr.success("LogOut")
}
}

