import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpApiService } from '../../../services/http-api-service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-modal-user',
  imports: [FormsModule,CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './modal-user.component.html',
  styleUrl: './modal-user.component.css'
})
export class ModalUserComponent {
userModel:any = {FullName:'',UserName:'',Password:'',RoleId:''}
  user:any = []
  SelectedId: any;
  constructor(private api:HttpApiService, private toastr:ToastrService,@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ModalUserComponent>){
  this.SelectedId = data;
  
    if(this.SelectedId){
      this.userModel.Id = this.SelectedId;
    }
  }

   ngOnInit(): void {
    if(this.SelectedId){
      this.GetUser(this.SelectedId);
    }
     this.API_Select_User()

  }
  

async onSubmit() {

   let res: any = await this.api.InsertUpdateUsers(this.userModel);

    if (res?.statusCode == 200) {
      this.toastr.success("Updated Successfully");
      this.dialogRef.close({ isSuccess: res.isSuccess });
    }else{
      this.toastr.error("Something went wrong");
    }   
  }

  async GetUser(Id:any) {
    var Data = {Id:Id}
    let res: any = await this.api.GetUser(Data);
    if (res.statusCode == 200) {
      
      this.userModel = res.data[0];
    }
  }

  async API_Select_User() {
    let res:any = await this.api.GetUser_OG();
    if (res.statusCode == 200) {
      this.user = res.data
      
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
