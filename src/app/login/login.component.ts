import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/local-storage.service';
import { ToastrService } from 'ngx-toastr'; 
import { HttpApiService } from '../../services/http-api-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  UserModel:any = {};  
  User:any = {};
  IsLoader: boolean = false;
  constructor( private api:HttpApiService,private route:Router,private Store:StorageService,private toastr:ToastrService){
    this.User= this.Store.getItem("User");
  }

  ngOnInit(): void { 
    
    if(this.User)  this.route.navigate(['dashboard']); 
  }

async onSubmit(){
  
  this.IsLoader = true;
  let res:any =await this.api.Login(this.UserModel);
  if(res.statusCode == 200){      
    this.Store.setItem("User",res.data);  
    this.Store.setItem("Token",res.data.token);  
     location.href = "/#/dashboard";
     location.reload();
  }else this.toastr.error(res.message);
this.IsLoader = false;
}


}
