import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { CustomerApiService } from '../../../../services/customer-api.service';
import { Customer } from '../../../shared/models/customer.model';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './customer-modal.component.html',
  styleUrl: './customer-modal.component.css'
})
export class CustomerModalComponent {
  customerModel: Customer = {
    CustomerName: '',
    TaxRegistrationNumber: '',
    City: '',
    StreetAddress: '',
    BuildingNumber: '',
    District: '',
    AddressAdditionalNumber: '',
    PostalCode: '',
    InvoicingCode: '',
    InvoicingEmail: '',
    InvoicingPhone: '',
    ContactTypeNumber: '',
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;

  constructor(
    private api: CustomerApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CustomerModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadCustomer(this.selectedId);
    }
  }

  async loadCustomer(id: number) {
    const res: any = await this.api.GetCustomer({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.customerModel = res.data[0];
    }
  }

  isValid(): boolean {
    return !!(this.customerModel.CustomerName && this.customerModel.CustomerName.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Customer Name is required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateCustomer(this.customerModel);
      if (res?.statusCode == 200) {
        this.toastr.success(this.selectedId ? 'Customer updated successfully' : 'Customer added successfully');
        this.dialogRef.close(true);
      } else {
        this.toastr.error(res?.message || 'Something went wrong');
      }
    } finally {
      this.isSaving = false;
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
