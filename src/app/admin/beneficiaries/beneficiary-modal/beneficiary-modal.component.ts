import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { BeneficiaryApiService } from '../../../../services/beneficiary-api.service';
import { CustomerApiService } from '../../../../services/customer-api.service';
import { BeneficiaryCustomerMappingApiService } from '../../../../services/beneficiary-customer-mapping-api.service';
import { Beneficiary } from '../../../shared/models/beneficiary.model';
import { Customer } from '../../../shared/models/customer.model';
import { CustomerModalComponent } from '../../customers/customer-modal/customer-modal.component';

@Component({
  selector: 'app-beneficiary-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './beneficiary-modal.component.html',
  styleUrl: './beneficiary-modal.component.css'
})
export class BeneficiaryModalComponent {
  beneficiaryModel: Beneficiary = {
    BeneficiaryName: '',
    BeneficiaryAddress: '',
    BankName: '',
    IBAN: '',
    Swift: '',
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;

  allCustomers: Customer[] = [];
  selectedCustomerIds: number[] = [];
  loadingCustomers: boolean = false;
  customerToAdd: number | null = null;

  constructor(
    private api: BeneficiaryApiService,
    private customerApi: CustomerApiService,
    private mappingApi: BeneficiaryCustomerMappingApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BeneficiaryModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    this.loadCustomers();
    if (this.selectedId) {
      this.loadBeneficiary(this.selectedId);
      this.loadMappedCustomers(this.selectedId);
    }
  }

  async loadBeneficiary(id: number) {
    const res: any = await this.api.GetBeneficiary({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.beneficiaryModel = res.data[0];
    }
  }

  async loadCustomers() {
    this.loadingCustomers = true;
    try {
      const res: any = await this.customerApi.GetCustomer({ IsActive: true, PageSize: 1000 });
      if (res?.statusCode == 200 && res.data) {
        this.allCustomers = res.data;
      }
    } finally {
      this.loadingCustomers = false;
    }
  }

  async loadMappedCustomers(beneficiaryId: number) {
    const res: any = await this.mappingApi.GetCustomersByBeneficiary(beneficiaryId);
    if (res?.statusCode == 200 && res.data) {
      this.selectedCustomerIds = res.data.map((c: any) => c.Id);
    }
  }

  get availableCustomers(): Customer[] {
    return this.allCustomers.filter(c => !this.selectedCustomerIds.includes(c.Id as number));
  }

  get selectedCustomers(): Customer[] {
    return this.allCustomers.filter(c => this.selectedCustomerIds.includes(c.Id as number));
  }

  addCustomerFromDropdown() {
    if (this.customerToAdd && !this.selectedCustomerIds.includes(this.customerToAdd)) {
      this.selectedCustomerIds.push(this.customerToAdd);
    }
    this.customerToAdd = null;
  }

  unlinkCustomer(id: number | null | undefined) {
    if (!id) return;
    const idx = this.selectedCustomerIds.indexOf(id);
    if (idx > -1) {
      this.selectedCustomerIds.splice(idx, 1);
    }
  }

  async openAddCustomer() {
    const ref = this.dialog.open(CustomerModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: null,
      disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCustomers();
      const newId = typeof result === 'number' ? result : null;
      if (newId && !this.selectedCustomerIds.includes(newId)) {
        this.selectedCustomerIds.push(newId);
      }
    }
  }

  async openEditCustomer(id: number | null | undefined) {
    if (!id) return;
    const ref = this.dialog.open(CustomerModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: id,
      disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCustomers();
    }
  }

  isValid(): boolean {
    return !!(this.beneficiaryModel.BeneficiaryName && this.beneficiaryModel.BeneficiaryName.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Beneficiary Name is required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateBeneficiary(this.beneficiaryModel);
      if (res?.statusCode == 200) {
        const beneficiaryId = res.data?.Id ?? this.selectedId;
        if (beneficiaryId) {
          await this.mappingApi.SaveBeneficiaryCustomers(beneficiaryId, this.selectedCustomerIds);
        }
        this.toastr.success(this.selectedId ? 'Beneficiary updated successfully' : 'Beneficiary added successfully');
        this.dialogRef.close(beneficiaryId || true);
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
