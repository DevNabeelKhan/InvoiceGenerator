import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../../../services/invoice-api.service';
import { Warehouse } from '../../../../shared/models/invoice.model';

@Component({
  selector: 'app-warehouse-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './warehouse-modal.component.html',
  styleUrl: './warehouse-modal.component.css'
})
export class WarehouseModalComponent {
  warehouseModel: Warehouse = {
    Code: '',
    Name: '',
    Phone: '',
    StreetAddress: '',
    BuildingNumber: '',
    District: '',
    City: '',
    PostalCode: '',
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;
  showAddress: boolean = true;

  constructor(
    private api: InvoiceApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<WarehouseModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadWarehouse(this.selectedId);
    }
  }

  async loadWarehouse(id: number) {
    const res: any = await this.api.GetWarehouse({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.warehouseModel = res.data[0];
    }
  }

  toggleAddress() {
    this.showAddress = !this.showAddress;
  }

  isValid(): boolean {
    return !!(this.warehouseModel.Code && this.warehouseModel.Code.trim().length > 0) &&
      !!(this.warehouseModel.Name && this.warehouseModel.Name.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Code and Name are required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateWarehouse(this.warehouseModel);
      if (res?.statusCode == 200) {
        const newId = res.data?.Id ?? this.selectedId;
        this.toastr.success(this.selectedId ? 'Warehouse updated successfully' : 'Warehouse added successfully');
        this.dialogRef.close(newId || true);
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
