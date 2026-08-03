import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../../services/invoice-api.service';
import { Currency } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currencies.component.html',
  styleUrl: './currencies.component.css'
})
export class CurrenciesComponent {
  currencies: Currency[] = [];
  isLoading = false;
  isSaving = false;

  editModel: Currency = { Code: '', Name: '', Symbol: '', ExchangeRate: 1, IsActive: true };
  editingId: number | null = null;
  showForm = false;

  constructor(private api: InvoiceApiService, private toastr: ToastrService) { }

  async ngOnInit() {
    await this.loadCurrencies();
  }

  async loadCurrencies() {
    this.isLoading = true;
    try {
      const res: any = await this.api.GetCurrency(null);
      this.currencies = res?.statusCode == 200 && res.data ? res.data : [];
    } finally {
      this.isLoading = false;
    }
  }

  openAdd() {
    this.editModel = { Code: '', Name: '', Symbol: '', ExchangeRate: 1, IsActive: true };
    this.editingId = null;
    this.showForm = true;
  }

  openEdit(currency: Currency) {
    this.editModel = { ...currency };
    this.editingId = currency.Id ?? null;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
  }

  isValid(): boolean {
    return !!(this.editModel.Code && this.editModel.Name);
  }

  async onSave() {
    if (!this.isValid()) {
      this.toastr.error('Currency code and name are required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateCurrency(this.editModel);
      if (res?.statusCode == 200) {
        this.toastr.success(this.editingId ? 'Currency updated' : 'Currency added');
        this.showForm = false;
        await this.loadCurrencies();
      } else {
        this.toastr.error(res?.message || 'Something went wrong');
      }
    } finally {
      this.isSaving = false;
    }
  }
}
