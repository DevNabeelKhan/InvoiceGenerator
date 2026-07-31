import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api-service';
import { StorageService } from '../../../services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  UserModel: any = {};
  User: any = {};
  constructor(private api: HttpApiService, private Store: StorageService, private toastr: ToastrService) {
    this.User = this.Store.getItem("User");
    this.UserModel.Id = this.User.id;
    this.UserModel.FullName = this.User.fullName;
    this.UserModel.Email = this.User.email;
    this.UserModel.UserName = this.User.userName;
    this.UserModel.RoleId = this.User.roleId;
    this.UserModel.Password = this.User.password; 
    this.UserModel.PictureUrl = this.User.pictureUrl; 
  }

  ngOnInit(): void {
  }

  async onSubmit(form:any) {
    let res: any = await this.api.InsertUpdateUser(this.UserModel);
    if (res.data) {
      this.toastr.success("Your Profile has been Update");
      this.UserModel.id = this.User.id;
      res.data.roleTitle = this.User.roleTitle;
      this.Store.setItem('User',res.data); 

      window.location.reload();
    }
}
async UploadFile($event: any) {
  this.UserModel.attachProfilePicture = $event.target.files[0];
}

}
