import { Component, Inject } from '@angular/core';
import { HttpApiService } from '../../../services/http-api-service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule , MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,} from '@angular/material/dialog';
  import {MatFormFieldModule} from '@angular/material/form-field'; 
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-delete-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule,   MatFormFieldModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions],
  templateUrl: './delete-popup.component.html',
  styleUrl: './delete-popup.component.css'
})
export class DeletePopupComponent {
  SelectedId: any;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,public dialogRef: MatDialogRef<DeletePopupComponent>) {
    this.SelectedId = data;
  }
 
Delete() {
    this.dialogRef.close({Id:this.SelectedId});
}
cancel(){
  this.dialogRef.close();
}


}
