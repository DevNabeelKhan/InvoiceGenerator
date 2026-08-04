import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../../../services/invoice-api.service';
import { Currency } from '../../../../shared/models/invoice.model';

@Component({
  selector: 'app-currency-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './currency-modal.component.html',
  styleUrl: './currency-modal.component.css'
})
export class CurrencyModalComponent {
  currencyModel: Currency = {
    Code: '',
    Title: '',
    Symbol: '',
    ExchangeRate: 1,
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;

  constructor(
    private api: InvoiceApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CurrencyModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadCurrency(this.selectedId);
    }
  }

  async loadCurrency(id: number) {
    const res: any = await this.api.GetCurrency(id);
    if (res?.statusCode == 200 && res.data?.length) {
      this.currencyModel = res.data[0];
    }
  }

  isValid(): boolean {
    return !!(this.currencyModel.Code && this.currencyModel.Title);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Currency code and name are required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateCurrency(this.currencyModel);
      if (res?.statusCode == 200) {
        this.toastr.success(this.selectedId ? 'Currency updated successfully' : 'Currency added successfully');
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
