import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
@Injectable({
  providedIn: 'root'
})
export class AlertService {
 
  
  constructor(
    private toastr:ToastrService
  ) { }

  Warning(message: string) {
    this.toastr.warning(message, 'Warning', {
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing'
    });
  }



  Error(message: string) {
    this.toastr.error(message, 'Error', {
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing'
    });
  }

  Success(message: string) {
    this.toastr.success(message, 'Success', {
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing'
    });
  }
}
