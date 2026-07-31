import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HttpApiService } from '../../../services/http-api-service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ModalUserComponent } from '../modal-user/modal-user.component';
import { DeletePopupComponent } from '../../shared/delete-popup/delete-popup.component';

@Component({
  selector: 'app-user',
  imports: [RouterOutlet,NgFor,NgIf],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  payload: any = { Id:'' };
    user: any = []
    constructor(private Api: HttpApiService,private toastr:ToastrService,private dialog:MatDialog) { }
  
    ngOnInit() {
      this.GetUser()
    }
  
    async GetUser() {
      try {
        console.log('Payload:', this.payload);
        const res: any = await this.Api.GetUser(this.payload);
        if (res?.data) {
          this.user = res.data;
          console.log(this.user);
        }
  
      }
      catch (error) {
        console.error('API error:', error);
      }
    }
  
    OpenDeleteModal(Id: any) {
        let dialogDelete = this.dialog.open(DeletePopupComponent, {
          data: Id, width: '530px',
        });
        dialogDelete.afterClosed().subscribe(async (result) => {
          if (result.Id) {
            this.deleteBank(result.Id);
          }
        })
      }
     
      async deleteBank(id: any) {
    
          let res:any = await this.Api.deleteDynamicRow({tableName:'User',Id:id});
          if(res.statusCode == 200) {
            this.toastr.success("Delete Successfully");
            this.GetUser();
          }
    
      }
    
      addupdatemodal(id?:any) {
     
        let dialogDelete = this.dialog.open(ModalUserComponent, {
          data: id,
          width: '800px',
        });
        dialogDelete.afterClosed().subscribe(async (result) => {
        if (result) {
            this.GetUser();
          }
        })
      }
}
