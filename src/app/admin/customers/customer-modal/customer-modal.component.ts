import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CustomerApiService } from '../../../../services/customer-api.service';
import { BeneficiaryApiService } from '../../../../services/beneficiary-api.service';
import { BeneficiaryCustomerMappingApiService } from '../../../../services/beneficiary-customer-mapping-api.service';
import { Customer } from '../../../shared/models/customer.model';
import { Beneficiary } from '../../../shared/models/beneficiary.model';
import { BeneficiaryModalComponent } from '../../beneficiaries/beneficiary-modal/beneficiary-modal.component';

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

  allBeneficiaries: Beneficiary[] = [];
  selectedBeneficiaryIds: number[] = [];
  loadingBeneficiaries: boolean = false;
  beneficiaryToAdd: number | null = null;

  constructor(
    private api: CustomerApiService,
    private beneficiaryApi: BeneficiaryApiService,
    private mappingApi: BeneficiaryCustomerMappingApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CustomerModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    this.loadBeneficiaries();
    if (this.selectedId) {
      this.loadCustomer(this.selectedId);
      this.loadMappedBeneficiaries(this.selectedId);
    }
  }

  async loadCustomer(id: number) {
    const res: any = await this.api.GetCustomer({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.customerModel = res.data[0];
    }
  }

  async loadBeneficiaries() {
    this.loadingBeneficiaries = true;
    try {
      const res: any = await this.beneficiaryApi.GetBeneficiary({ IsActive: true, PageSize: 1000 });
      if (res?.statusCode == 200 && res.data) {
        this.allBeneficiaries = res.data;
      }
    } finally {
      this.loadingBeneficiaries = false;
    }
  }

  async loadMappedBeneficiaries(customerId: number) {
    const res: any = await this.mappingApi.GetBeneficiariesByCustomer(customerId);
    if (res?.statusCode == 200 && res.data) {
      this.selectedBeneficiaryIds = res.data.map((b: any) => b.Id);
    }
  }

  get availableBeneficiaries(): Beneficiary[] {
    return this.allBeneficiaries.filter(b => !this.selectedBeneficiaryIds.includes(b.Id as number));
  }

  get selectedBeneficiaries(): Beneficiary[] {
    return this.allBeneficiaries.filter(b => this.selectedBeneficiaryIds.includes(b.Id as number));
  }

  addBeneficiaryFromDropdown() {
    if (this.beneficiaryToAdd && !this.selectedBeneficiaryIds.includes(this.beneficiaryToAdd)) {
      this.selectedBeneficiaryIds.push(this.beneficiaryToAdd);
    }
    this.beneficiaryToAdd = null;
  }

  unlinkBeneficiary(id: number | null | undefined) {
    if (!id) return;
    const idx = this.selectedBeneficiaryIds.indexOf(id);
    if (idx > -1) {
      this.selectedBeneficiaryIds.splice(idx, 1);
    }
  }

  async openAddBeneficiary() {
    const ref = this.dialog.open(BeneficiaryModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: null,
      disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadBeneficiaries();
      const newId = typeof result === 'number' ? result : null;
      if (newId && !this.selectedBeneficiaryIds.includes(newId)) {
        this.selectedBeneficiaryIds.push(newId);
      }
    }
  }

  async openEditBeneficiary(id: number | null | undefined) {
    if (!id) return;
    const ref = this.dialog.open(BeneficiaryModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: id,
      disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadBeneficiaries();
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
        const customerId = res.data?.Id ?? this.selectedId;
        if (customerId) {
          await this.mappingApi.SaveCustomerBeneficiaries(customerId, this.selectedBeneficiaryIds);
        }
        this.toastr.success(this.selectedId ? 'Customer updated successfully' : 'Customer added successfully');
        this.dialogRef.close(customerId || true);
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
