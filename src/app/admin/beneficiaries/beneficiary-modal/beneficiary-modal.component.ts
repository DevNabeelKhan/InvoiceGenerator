import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { BeneficiaryApiService } from '../../../../services/beneficiary-api.service';
import { Beneficiary } from '../../../shared/models/beneficiary.model';

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

  constructor(
    private api: BeneficiaryApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BeneficiaryModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadBeneficiary(this.selectedId);
    }
  }

  async loadBeneficiary(id: number) {
    const res: any = await this.api.GetBeneficiary({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.beneficiaryModel = res.data[0];
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
        this.toastr.success(this.selectedId ? 'Beneficiary updated successfully' : 'Beneficiary added successfully');
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
