import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../../services/invoice-api.service';
import { TranslationService } from '../../../../services/translation.service';
import { Company } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.css'
})
export class CompanySettingsComponent {
  company: Company = {
    Name: '',
    ArabicName: '',
    Address: '',
    ArabicAddress: '',
    Email: '',
    Phone: '',
    Website: '',
    VATNumber: '',
    LogoPath: '',
    StampPath: '',
    BankName: '',
    BankAccountNumber: '',
    IBAN: '',
    SwiftCode: '',
    AccountCurrency: '',
    BeneficiaryName: '',
    Country: '',
    City: '',
    IsActive: true
  };
  isLoading = false;
  isSaving = false;

  private nameTranslateTimer: any;
  private addressTranslateTimer: any;
  arabicNameManuallyEdited = false;
  arabicAddressManuallyEdited = false;

  constructor(private api: InvoiceApiService, private toastr: ToastrService, private translationService: TranslationService) { }

  async ngOnInit() {
    await this.loadCompany();
  }

  async loadCompany() {
    this.isLoading = true;
    try {
      const res: any = await this.api.GetCompany(null);
      if (res?.statusCode == 200 && res.data?.length) {
        this.company = res.data[0];
        // Treat existing Arabic values as manually set so loading a saved
        // record doesn't immediately overwrite them on the next keystroke.
        this.arabicNameManuallyEdited = !!this.company.ArabicName;
        this.arabicAddressManuallyEdited = !!this.company.ArabicAddress;
      }
    } finally {
      this.isLoading = false;
    }
  }

  onNameChange() {
    clearTimeout(this.nameTranslateTimer);
    if (this.arabicNameManuallyEdited) return;
    this.nameTranslateTimer = setTimeout(async () => {
      const translated = await this.translationService.translateToArabic(this.company.Name);
      if (translated && !this.arabicNameManuallyEdited) {
        this.company.ArabicName = translated;
      }
    }, 600);
  }

  onAddressChange() {
    clearTimeout(this.addressTranslateTimer);
    if (this.arabicAddressManuallyEdited) return;
    this.addressTranslateTimer = setTimeout(async () => {
      const translated = await this.translationService.translateToArabic(this.company.Address);
      if (translated && !this.arabicAddressManuallyEdited) {
        this.company.ArabicAddress = translated;
      }
    }, 600);
  }

  onArabicNameEdited() {
    this.arabicNameManuallyEdited = true;
  }

  onArabicAddressEdited() {
    this.arabicAddressManuallyEdited = true;
  }

  isValid(): boolean {
    return !!(this.company.Name && this.company.Name.trim().length > 0);
  }

  async onSave() {
    if (!this.isValid()) {
      this.toastr.error('Company name is required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateCompany(this.company);
      if (res?.statusCode == 200) {
        this.toastr.success('Company details saved successfully');
        this.company.Id = res.data?.Id ?? this.company.Id;
      } else {
        this.toastr.error(res?.message || 'Something went wrong');
      }
    } finally {
      this.isSaving = false;
    }
  }
}
