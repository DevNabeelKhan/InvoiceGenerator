import { Component } from '@angular/core';
import { StorageService } from '../../../services/local-storage.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
user:any = {};
  constructor(private store:StorageService){
    this.user = store.getItem("User");
}
}
