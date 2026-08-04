import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../../../services/invoice-api.service';
import { TranslationService } from '../../../../../services/translation.service';
import { Company } from '../../../../shared/models/invoice.model';

@Component({
  selector: 'app-company-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './company-modal.component.html',
  styleUrl: './company-modal.component.css'
})
export class CompanyModalComponent {
  companyModel: Company = {
    Title: '',
    ArabicName: '',
    Address: '',
    VATNumber: '',
    Email: '',
    Phone: '',
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;

  private nameTranslateTimer: any;
  private addressTranslateTimer: any;
  arabicNameManuallyEdited = false;
  arabicAddressManuallyEdited = false;

  constructor(
    private api: InvoiceApiService,
    private toastr: ToastrService,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CompanyModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadCompany(this.selectedId);
    }
  }

  async loadCompany(id: number) {
    const res: any = await this.api.GetCompany(id);
    if (res?.statusCode == 200 && res.data?.length) {
      this.companyModel = res.data[0];
      this.arabicNameManuallyEdited = !!this.companyModel.ArabicName;
      this.arabicAddressManuallyEdited = !!this.companyModel.Address;
    }
  }

  onNameChange() {
    clearTimeout(this.nameTranslateTimer);
    if (this.arabicNameManuallyEdited) return;
    this.nameTranslateTimer = setTimeout(async () => {
      const translated = await this.translationService.translateToArabic(this.companyModel.Title);
      if (translated && !this.arabicNameManuallyEdited) {
        this.companyModel.ArabicName = translated;
      }
    }, 600);
  }

  onArabicNameEdited() {
    this.arabicNameManuallyEdited = true;
  }

  isValid(): boolean {
    return !!(this.companyModel.Title && this.companyModel.Title.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Company name is required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateCompany(this.companyModel);
      if (res?.statusCode == 200) {
        this.toastr.success(this.selectedId ? 'Company updated successfully' : 'Company added successfully');
        const newId = res.data?.Id ?? this.selectedId;
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
