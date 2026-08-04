import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { InvoiceApiService } from '../../../../services/invoice-api.service';
import { CustomerApiService } from '../../../../services/customer-api.service';
import { ProductApiService } from '../../../../services/product-api.service';
import { ConfigurationApiService } from '../../../../services/configuration-api.service';

import { Invoice, InvoiceProductLine, Company, Currency } from '../../../shared/models/invoice.model';
import { Customer } from '../../../shared/models/customer.model';
import { Product } from '../../../shared/models/product.model';
import { ConfigurationItem, getConfigurationTypeBySlug } from '../../../shared/models/configuration.model';

import { SearchableSelectComponent, SearchableOption } from '../../../shared/searchable-select/searchable-select.component';

import { CustomerModalComponent } from '../../customers/customer-modal/customer-modal.component';
import { ProductModalComponent } from '../../products/product-modal/product-modal.component';
import { ConfigurationModalComponent } from '../../configuration/configuration-modal/configuration-modal.component';
import { CompanyModalComponent } from '../../settings/company-settings/company-modal/company-modal.component';
import { CurrencyModalComponent } from '../../settings/currencies/currency-modal/currency-modal.component';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, SearchableSelectComponent],
  templateUrl: './invoice-edit.component.html',
  styleUrl: './invoice-edit.component.css'
})
export class InvoiceEditComponent implements OnInit {

  invoiceId: number | null = null;
  isSaving: boolean = false;
  isLoading: boolean = false;
  showPreview: boolean = true;

  invoice: Invoice = {
    InvoiceDate: this.toDateInput(new Date()),
    DueDate: this.toDateInput(new Date(new Date().setDate(new Date().getDate() + 30))),
    ExchangeRate: 1,
    DiscountPercentage: 0,
    DiscountAmount: 0,
    RetentionPercentage: 0,
    RetentionAmount: 0,
    RoundOffAmount: 0,
    Status: 'Draft',
    Notes: '',
    Products: []
  };

  lines: InvoiceProductLine[] = [];

  customers: Customer[] = [];
  products: Product[] = [];
  accounts: ConfigurationItem[] = [];
  currencies: Currency[] = [];
  companies: Company[] = [];

  productOptions: SearchableOption[] = [];
  accountOptions: SearchableOption[] = [];

  selectedCompany: Company | null = null;
  selectedCustomer: Customer | null = null;

  qrImageBase64: string | null = null;

  constructor(
    private api: InvoiceApiService,
    private customerApi: CustomerApiService,
    private productApi: ProductApiService,
    private configApi: ConfigurationApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.invoiceId = idParam ? Number(idParam) : null;

    await Promise.all([
      this.loadCustomers(),
      this.loadProducts(),
      this.loadAccounts(),
      this.loadCurrencies(),
      this.loadCompanies()
    ]);

    if (this.invoiceId) {
      await this.loadInvoice(this.invoiceId);
    } else {
      this.addLine();
      if (this.companies.length) {
        this.invoice.CompanyId = this.companies[0].Id;
        this.onCompanyChange();
      }
      if (this.currencies.length) {
        const sar = this.currencies.find(c => c.Code === 'SAR') || this.currencies[0];
        this.invoice.CurrencyId = sar.Id;
        this.invoice.CurrencySymbol = sar.Symbol || sar.Code || '';
        this.invoice.CurrencyCode = sar.Code || '';
      }
    }
  }

  private toDateInput(d: Date): string {
    return d.toISOString().substring(0, 10);
  }

  async loadCustomers() {
    const res: any = await this.customerApi.GetCustomer({ IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) this.customers = res.data;
  }

  async loadProducts() {
    const res: any = await this.productApi.GetProduct({ IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) {
      this.products = res.data;
      this.productOptions = this.products.map(p => ({
        value: p.Id,
        label: p.Title || p.ServiceDescription || ''
      }));
    }
  }

  async loadAccounts() {
    const res: any = await this.configApi.GetConfiguration('AccountType', { IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) {
      this.accounts = res.data;
      this.accountOptions = this.accounts.map(a => ({ value: a.Id, label: a.Title || '' }));
    }
  }

  async loadCurrencies() {
    const res: any = await this.api.GetCurrency(null);
    if (res?.statusCode == 200 && res.data) this.currencies = res.data;
  }

  async loadCompanies() {
    const res: any = await this.api.GetCompany(null);
    if (res?.statusCode == 200 && res.data) this.companies = res.data;
  }

  async loadInvoice(id: number) {
    this.isLoading = true;
    try {
      const res: any = await this.api.GetInvoice({ Id: id });
      if (res?.statusCode == 200 && res.data) {
        this.invoice = res.data;
        this.invoice.InvoiceDate = this.invoice.InvoiceDate ? this.toDateInput(new Date(this.invoice.InvoiceDate)) : null;
        this.invoice.DueDate = this.invoice.DueDate ? this.toDateInput(new Date(this.invoice.DueDate)) : null;
        this.lines = (this.invoice.Products || []).map(p => ({ ...p }));
        this.onCompanyChange();
        this.onCustomerChange();
        if (this.invoice.GeneratedQRCode) {
          await this.regenerateQr();
        }
      } else {
        this.toastr.error('Invoice not found');
        this.router.navigate(['/invoices']);
      }
    } finally {
      this.isLoading = false;
    }
  }

  // ---------------- Quick-add dialogs ----------------

  async openAddCompany() {
    const ref = this.dialog.open(CompanyModalComponent, {
      data: null, width: '700px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCompanies();
      if (typeof result === 'number') {
        this.invoice.CompanyId = result;
        this.onCompanyChange();
      }
    }
  }

  async openAddCustomer() {
    const ref = this.dialog.open(CustomerModalComponent, {
      data: null, width: '900px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCustomers();
      if (typeof result === 'number') {
        this.invoice.CustomerId = result;
        this.onCustomerChange();
      }
    }
  }

  async openAddCurrency() {
    const ref = this.dialog.open(CurrencyModalComponent, {
      data: null, width: '520px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCurrencies();
      if (typeof result === 'number') {
        this.invoice.CurrencyId = result;
        this.onCurrencyChange();
      }
    }
  }

  async openAddProduct(line: InvoiceProductLine) {
    const ref = this.dialog.open(ProductModalComponent, {
      data: null, width: '900px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadProducts();
      if (typeof result === 'number') {
        line.ProductId = result;
        this.onProductSelect(line);
      }
    }
  }

  async openAddAccount(line: InvoiceProductLine) {
    const typeInfo = getConfigurationTypeBySlug('account-type');
    if (!typeInfo) return;
    const ref = this.dialog.open(ConfigurationModalComponent, {
      data: { typeInfo }, width: '480px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadAccounts();
      if (typeof result === 'number') {
        line.AccountId = result;
        this.recalculateLine(line);
      }
    }
  }

  onCompanyChange() {
    this.selectedCompany = this.companies.find(c => c.Id === this.invoice.CompanyId) || null;
    if (this.selectedCompany) {
      this.invoice.CompanyName = this.selectedCompany.Name;
      this.invoice.CompanyArabicName = this.selectedCompany.ArabicName;
      this.invoice.CompanyAddress = this.selectedCompany.Address;
      this.invoice.CompanyArabicAddress = this.selectedCompany.ArabicAddress;
      this.invoice.CompanyVATNumber = this.selectedCompany.VATNumber;
      this.invoice.LogoPath = this.selectedCompany.LogoPath;
      this.invoice.StampPath = this.selectedCompany.StampPath;
      this.invoice.CompanyBankName = this.selectedCompany.BankName;
      this.invoice.BankAccountNumber = this.selectedCompany.BankAccountNumber;
      this.invoice.IBAN = this.selectedCompany.IBAN;
      this.invoice.SwiftCode = this.selectedCompany.SwiftCode;
      this.invoice.AccountCurrency = this.selectedCompany.AccountCurrency;
    }
  }

  onCustomerChange() {
    this.selectedCustomer = this.customers.find(c => c.Id === this.invoice.CustomerId) || null;
    if (this.selectedCustomer) {
      this.invoice.CustomerName = this.selectedCustomer.CustomerName;
      this.invoice.CustomerVATNumber = this.selectedCustomer.TaxRegistrationNumber;
      this.invoice.CustomerAddress = this.selectedCustomer.StreetAddress;
      this.invoice.CustomerCity = this.selectedCustomer.City;
      this.invoice.CustomerEmail = (this.selectedCustomer as any).Email || this.selectedCustomer.InvoicingEmail;
      this.invoice.CustomerPhone = (this.selectedCustomer as any).Phone || this.selectedCustomer.InvoicingPhone;
      this.invoice.CustomerArabicName = (this.selectedCustomer as any).ArabicName;
      this.invoice.CustomerArabicAddress = (this.selectedCustomer as any).ArabicAddress;
    }
  }

  onCurrencyChange() {
    const cur = this.currencies.find(c => c.Id === this.invoice.CurrencyId);
    if (cur) {
      this.invoice.CurrencyCode = cur.Code;
      this.invoice.CurrencySymbol = cur.Symbol || cur.Code || '';
      this.invoice.ExchangeRate = cur.ExchangeRate || 1;
    }
  }

  // ---------------- Line item operations ----------------

  addLine() {
    this.lines.push({
      Description: '',
      Unit: 'EA',
      Quantity: 1,
      Price: 0,
      DiscountPercentage: 0,
      DiscountAmount: 0,
      TaxRate: 15,
      TaxableAmount: 0,
      VATAmount: 0,
      LineTotal: 0,
      SortOrder: this.lines.length
    });
    this.recalculateAll();
  }

  removeLine(index: number) {
    this.lines.splice(index, 1);
    this.lines.forEach((l, i) => l.SortOrder = i);
    this.recalculateAll();
  }

  duplicateLine(index: number) {
    const clone = { ...this.lines[index], Id: null };
    this.lines.splice(index + 1, 0, clone);
    this.lines.forEach((l, i) => l.SortOrder = i);
    this.recalculateAll();
  }

  clearLines() {
    this.lines = [];
    this.addLine();
  }

  onProductSelect(line: InvoiceProductLine) {
    const product = this.products.find(p => p.Id === line.ProductId);
    if (product) {
      line.Description = product.ServiceDescription || product.Title || '';
      line.Price = product.SellingPrice || 0;
      line.AccountId = product.RevenueAccountID || null;
      line.TaxRate = product.RevenueTaxRatePercentage ?? line.TaxRate ?? 15;
    }
    this.recalculateLine(line);
  }

  onLineDescriptionChange(line: InvoiceProductLine, description: string) {
    line.Description = description;
    this.recalculateLine(line);
  }

  onLineProductChange(line: InvoiceProductLine, productId: number | null) {
    line.ProductId = productId;
    this.onProductSelect(line);
  }

  onLineAccountChange(line: InvoiceProductLine, accountId: number | null) {
    line.AccountId = accountId;
    this.recalculateLine(line);
  }

  recalculateLine(line: InvoiceProductLine) {
    const qty = line.Quantity || 0;
    const price = line.Price || 0;
    const lineAmount = qty * price;

    let discountAmt = line.DiscountAmount || 0;
    if ((line.DiscountPercentage || 0) > 0) {
      discountAmt = Math.round((lineAmount * (line.DiscountPercentage || 0) / 100) * 100) / 100;
      line.DiscountAmount = discountAmt;
    }

    const taxable = Math.max(0, lineAmount - discountAmt);
    const vat = Math.round((taxable * (line.TaxRate || 0) / 100) * 100) / 100;
    const total = taxable + vat;

    line.TaxableAmount = taxable;
    line.VATAmount = vat;
    line.LineTotal = total;

    this.recalculateAll();
  }

  recalculateAll() {
    const subtotal = this.lines.reduce((sum, l) => sum + ((l.Quantity || 0) * (l.Price || 0)), 0);
    const totalVat = this.lines.reduce((sum, l) => sum + (l.VATAmount || 0), 0);
    const totalTaxable = this.lines.reduce((sum, l) => sum + (l.TaxableAmount || 0), 0);

    let invoiceDiscount = this.invoice.DiscountAmount || 0;
    if ((this.invoice.DiscountPercentage || 0) > 0) {
      invoiceDiscount = Math.round((subtotal * (this.invoice.DiscountPercentage || 0) / 100) * 100) / 100;
      this.invoice.DiscountAmount = invoiceDiscount;
    }

    const taxableAfterInvoiceDiscount = Math.max(0, totalTaxable - invoiceDiscount);

    let retentionAmt = this.invoice.RetentionAmount || 0;
    if ((this.invoice.RetentionPercentage || 0) > 0) {
      retentionAmt = Math.round(((taxableAfterInvoiceDiscount + totalVat) * (this.invoice.RetentionPercentage || 0) / 100) * 100) / 100;
      this.invoice.RetentionAmount = retentionAmt;
    }

    const grandTotal = taxableAfterInvoiceDiscount + totalVat - retentionAmt + (this.invoice.RoundOffAmount || 0);

    this.invoice.Subtotal = Math.round(subtotal * 100) / 100;
    this.invoice.TaxAmount = Math.round(totalVat * 100) / 100;
    this.invoice.GrandTotal = Math.round(grandTotal * 100) / 100;
  }

  getAccountTitle(accountId?: number | null): string {
    const acc = this.accounts.find(a => a.Id === accountId);
    return acc ? (acc.Title || '') : '';
  }

  // ---------------- Validation ----------------

  isValid(): boolean {
    if (!this.invoice.CustomerId) {
      this.toastr.error('Please select a customer');
      return false;
    }
    if (!this.invoice.CurrencyId) {
      this.toastr.error('Please select a currency');
      return false;
    }
    if (!this.invoice.InvoiceDate) {
      this.toastr.error('Invoice date is required');
      return false;
    }
    if (!this.lines.length) {
      this.toastr.error('At least one invoice line is required');
      return false;
    }
    for (const line of this.lines) {
      if (!line.Description || !line.Description.trim()) {
        this.toastr.error('Description is required for all lines');
        return false;
      }
      if (!line.AccountId) {
        this.toastr.error('Account is required for all lines');
        return false;
      }
      if (!line.Quantity || line.Quantity <= 0) {
        this.toastr.error('Quantity must be greater than zero');
        return false;
      }
    }
    return true;
  }

  // ---------------- Save / Actions ----------------

  async onSave(status: 'Draft' | 'Approved' = 'Draft') {
    if (!this.isValid()) return;

    this.isSaving = true;
    try {
      this.invoice.Status = status;
      this.invoice.Draft = status === 'Draft';
      this.invoice.Approved = status === 'Approved';

      const payload: any = {
        ...this.invoice,
        Products: this.lines
      };

      const res: any = await this.api.InsertUpdateInvoice(payload);
      if (res?.statusCode == 200) {
        this.toastr.success(this.invoiceId ? 'Invoice updated successfully' : 'Invoice created successfully');
        const newId = res.data?.Id || this.invoiceId;
        if (newId) {
          this.invoiceId = newId;
          await this.loadInvoice(newId);
        }
        this.router.navigate(['/invoices']);
      } else {
        this.toastr.error(res?.message || 'Something went wrong');
      }
    } finally {
      this.isSaving = false;
    }
  }

  async regenerateQr() {
    if (!this.invoiceId) return;
    const res: any = await this.api.GenerateQr(this.invoiceId);
    if (res?.statusCode == 200 && res.data) {
      this.qrImageBase64 = res.data.qrImageBase64 || res.data.QrImageBase64;
    }
  }

  downloadPdf() {
    if (!this.invoiceId) {
      this.toastr.info('Save the invoice first to generate PDF');
      return;
    }
    window.open(this.api.getDownloadPdfUrl(this.invoiceId), '_blank');
  }

  downloadXml() {
    if (!this.invoiceId) {
      this.toastr.info('Save the invoice first to generate XML');
      return;
    }
    window.open(this.api.getGenerateXmlUrl(this.invoiceId), '_blank');
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  cancel() {
    this.router.navigate(['/invoices']);
  }
}
