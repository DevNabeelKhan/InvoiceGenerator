import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { InvoiceApiService } from '../../../../services/invoice-api.service';
import { CustomerApiService } from '../../../../services/customer-api.service';
import { ProductApiService } from '../../../../services/product-api.service';
import { ConfigurationApiService } from '../../../../services/configuration-api.service';

import { Invoice, InvoiceProductLine, Company, Currency, Project, Warehouse } from '../../../shared/models/invoice.model';
import { Customer } from '../../../shared/models/customer.model';
import { Product } from '../../../shared/models/product.model';
import { ConfigurationItem, getConfigurationTypeBySlug } from '../../../shared/models/configuration.model';

import { CustomerModalComponent } from '../../customers/customer-modal/customer-modal.component';
import { ProductModalComponent } from '../../products/product-modal/product-modal.component';
import { ConfigurationModalComponent } from '../../configuration/configuration-modal/configuration-modal.component';
import { CompanyModalComponent } from '../../settings/company-settings/company-modal/company-modal.component';
import { CurrencyModalComponent } from '../../settings/currencies/currency-modal/currency-modal.component';
import { ProjectModalComponent } from './project-modal/project-modal.component';
import { WarehouseModalComponent } from './warehouse-modal/warehouse-modal.component';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './invoice-edit.component.html',
  styleUrl: './invoice-edit.component.css'
})
export class InvoiceEditComponent implements OnInit, AfterViewInit, OnDestroy {

  invoiceId: number | null = null;
  isSaving: boolean = false;
  isLoading: boolean = false;
  showPreview: boolean = true;
  attemptedSave: boolean = false;

  previewPanelWidth: number = 540;
  private readonly minPreviewWidth = 360;
  private readonly maxPreviewWidth = 900;
  private isResizing = false;
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private onResizeMoveBound = (e: MouseEvent) => this.onResizeMove(e);
  private onResizeEndBound = () => this.onResizeEnd();

  @ViewChild('previewPanel') previewPanelEl?: ElementRef<HTMLDivElement>;
  @ViewChild('previewPaper') previewPaperEl?: ElementRef<HTMLDivElement>;
  readonly previewIntrinsicWidth = 480;
  previewScale = 1;
  previewScaledHeight = 0;
  private panelResizeObserver?: ResizeObserver;
  private paperResizeObserver?: ResizeObserver;

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
    PricesIncludeTax: false,
    Products: []
  };

  lines: InvoiceProductLine[] = [];

  customers: Customer[] = [];
  products: Product[] = [];
  accounts: ConfigurationItem[] = [];
  costCenters: ConfigurationItem[] = [];
  revenueRecognitions: ConfigurationItem[] = [];
  currencies: Currency[] = [];
  companies: Company[] = [];
  projects: Project[] = [];
  warehouses: Warehouse[] = [];

  selectedCompany: Company | null = null;
  selectedCustomer: Customer | null = null;

  showProjectDropdown = false;
  projectSearchText: string = '';

  showWarehouseDropdown = false;
  warehouseSearchText: string = '';

  showCompanyDropdown = false;
  companySearchText: string = '';

  showCustomerDropdown = false;
  customerSearchText: string = '';

  qrImageBase64: string | null = null;

  showFieldsMenu = false;
  visibleFields: { purchaseOrder: boolean; reference: boolean; project: boolean; warehouse: boolean } = {
    purchaseOrder: true,
    reference: true,
    project: true,
    warehouse: true
  };
  fieldToggles: { key: 'purchaseOrder' | 'reference' | 'project' | 'warehouse'; label: string }[] = [
    { key: 'purchaseOrder', label: 'Purchase order' },
    { key: 'reference', label: 'Reference' },
    { key: 'project', label: 'Project' },
    { key: 'warehouse', label: 'Warehouse' }
  ];

  openDescDropdownIndex: number | null = null;
  descDropdownPos: { top: number; left: number; width: number } = { top: 0, left: 0, width: 0 };

  openLineDropdown: { index: number; field: 'account' | 'costCenter' | 'revenueRecognition' } | null = null;
  lineDropdownSearch: string = '';
  lineDropdownPos: { top: number; left: number; width: number } = { top: 0, left: 0, width: 0 };

  showAdjustTotal = false;
  showDocMenu = false;
  showLineFieldsMenu = false;
  visibleLineFields: { taxRate: boolean; account: boolean; discount: boolean; revenueRecognition: boolean; costCenter: boolean; total: boolean } = {
    taxRate: true,
    account: true,
    discount: true,
    revenueRecognition: true,
    costCenter: true,
    total: true
  };
  lineFieldToggles: { key: 'taxRate' | 'account' | 'discount' | 'revenueRecognition' | 'costCenter' | 'total'; label: string }[] = [
    { key: 'taxRate', label: 'Tax rate' },
    { key: 'account', label: 'Account' },
    { key: 'discount', label: 'Discount' },
    { key: 'revenueRecognition', label: 'Revenue recognition' },
    { key: 'costCenter', label: 'Cost center' },
    { key: 'total', label: 'Total' }
  ];

  constructor(
    private api: InvoiceApiService,
    private customerApi: CustomerApiService,
    private productApi: ProductApiService,
    private configApi: ConfigurationApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private ngZone: NgZone
  ) { }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.invoiceId = idParam ? Number(idParam) : null;

    await Promise.all([
      this.loadCustomers(),
      this.loadProducts(),
      this.loadAccounts(),
      this.loadCurrencies(),
      this.loadCompanies(),
      this.loadProjects(),
      this.loadWarehouses(),
      this.loadCostCenters(),
      this.loadRevenueRecognitions()
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
    if (res?.statusCode == 200 && res.data) this.products = res.data;
  }

  async loadAccounts() {
    const res: any = await this.configApi.GetConfiguration('AccountType', { IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) this.accounts = res.data;
  }

  async loadCostCenters() {
    const res: any = await this.configApi.GetConfiguration('CostCenter', { IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) this.costCenters = res.data;
  }

  async loadRevenueRecognitions() {
    const res: any = await this.configApi.GetConfiguration('RevenueRecognitionType', { IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) this.revenueRecognitions = res.data;
  }

  async loadCurrencies() {
    const res: any = await this.api.GetCurrency(null);
    if (res?.statusCode == 200 && res.data) this.currencies = res.data;
  }

  async loadProjects() {
    const res: any = await this.api.GetProject({ IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) this.projects = res.data;
  }

  async loadWarehouses() {
    const res: any = await this.api.GetWarehouse({ IsActive: true, PageSize: 1000 });
    if (res?.statusCode == 200 && res.data) this.warehouses = res.data;
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
        if (this.invoice.PurchaseOrderNumber) this.visibleFields.purchaseOrder = true;
        if (this.invoice.Reference) this.visibleFields.reference = true;
        if (this.invoice.ProjectName) this.visibleFields.project = true;
        if (this.invoice.WarehouseName) this.visibleFields.warehouse = true;
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

  async openEditCustomer() {
    if (!this.invoice.CustomerId) return;
    const ref = this.dialog.open(CustomerModalComponent, {
      data: this.invoice.CustomerId, width: '900px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCustomers();
      this.onCustomerChange();
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

  get filteredCompanies(): Company[] {
    const term = (this.companySearchText || '').trim().toLowerCase();
    if (!term) return this.companies;
    return this.companies.filter(c => (c.Title || '').toLowerCase().includes(term));
  }

  get filteredCustomers(): Customer[] {
    const term = (this.customerSearchText || '').trim().toLowerCase();
    if (!term) return this.customers;
    return this.customers.filter(c => (c.CustomerName || '').toLowerCase().includes(term));
  }

  openCustomerDropdown() {
    this.showCustomerDropdown = true;
    this.customerSearchText = '';
  }

  closeCustomerDropdown() {
    this.showCustomerDropdown = false;
    this.customerSearchText = '';
  }

  selectCustomer(c: Customer) {
    this.invoice.CustomerId = c.Id;
    this.onCustomerChange();
    this.closeCustomerDropdown();
  }

  openCompanyDropdown() {
    this.showCompanyDropdown = true;
    this.companySearchText = '';
  }

  closeCompanyDropdown() {
    this.showCompanyDropdown = false;
    this.companySearchText = '';
  }

  selectCompany(c: Company) {
    this.invoice.CompanyId = c.Id;
    this.onCompanyChange();
    this.closeCompanyDropdown();
  }

  async editSelectedCompany() {
    if (!this.invoice.CompanyId) return;
    const ref = this.dialog.open(CompanyModalComponent, {
      data: this.invoice.CompanyId, width: '700px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCompanies();
      this.onCompanyChange();
    }
  }

  get filteredProjects(): Project[] {
    const term = (this.projectSearchText || '').trim().toLowerCase();
    if (!term) return this.projects;
    return this.projects.filter(p => (p.Title || '').toLowerCase().includes(term));
  }

  openProjectDropdown() {
    this.showProjectDropdown = true;
    this.projectSearchText = '';
  }

  closeProjectDropdown() {
    this.showProjectDropdown = false;
    this.projectSearchText = '';
  }

  selectProject(p: Project) {
    this.invoice.ProjectId = p.Id;
    this.invoice.ProjectName = p.Title;
    this.closeProjectDropdown();
  }

  clearProject() {
    this.invoice.ProjectId = null;
    this.invoice.ProjectName = null;
  }

  async openAddProject() {
    const ref = this.dialog.open(ProjectModalComponent, {
      data: null, width: '560px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadProjects();
      if (typeof result === 'number') {
        const p = this.projects.find(pr => pr.Id === result);
        if (p) this.selectProject(p);
      }
    }
    this.closeProjectDropdown();
  }

  async editSelectedProject() {
    if (!this.invoice.ProjectId) return;
    const ref = this.dialog.open(ProjectModalComponent, {
      data: this.invoice.ProjectId, width: '560px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadProjects();
      const p = this.projects.find(pr => pr.Id === this.invoice.ProjectId);
      if (p) this.invoice.ProjectName = p.Title;
    }
  }

  get filteredWarehouses(): Warehouse[] {
    const term = (this.warehouseSearchText || '').trim().toLowerCase();
    if (!term) return this.warehouses;
    return this.warehouses.filter(w => (w.Name || '').toLowerCase().includes(term));
  }

  openWarehouseDropdown() {
    this.showWarehouseDropdown = true;
    this.warehouseSearchText = '';
  }

  closeWarehouseDropdown() {
    this.showWarehouseDropdown = false;
    this.warehouseSearchText = '';
  }

  selectWarehouse(w: Warehouse) {
    this.invoice.WarehouseId = w.Id;
    this.invoice.WarehouseName = w.Name;
    this.closeWarehouseDropdown();
  }

  clearWarehouse() {
    this.invoice.WarehouseId = null;
    this.invoice.WarehouseName = null;
  }

  async openAddWarehouse() {
    const ref = this.dialog.open(WarehouseModalComponent, {
      data: null, width: '560px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadWarehouses();
      if (typeof result === 'number') {
        const w = this.warehouses.find(wh => wh.Id === result);
        if (w) this.selectWarehouse(w);
      }
    }
    this.closeWarehouseDropdown();
  }

  async editSelectedWarehouse() {
    if (!this.invoice.WarehouseId) return;
    const ref = this.dialog.open(WarehouseModalComponent, {
      data: this.invoice.WarehouseId, width: '560px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadWarehouses();
      const w = this.warehouses.find(wh => wh.Id === this.invoice.WarehouseId);
      if (w) this.invoice.WarehouseName = w.Name;
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

  async openAddCostCenter(line: InvoiceProductLine) {
    const typeInfo = getConfigurationTypeBySlug('cost-center');
    if (!typeInfo) return;
    const ref = this.dialog.open(ConfigurationModalComponent, {
      data: { typeInfo }, width: '480px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadCostCenters();
      if (typeof result === 'number') {
        line.CostCenterId = result;
      }
    }
  }

  async openAddRevenueRecognition(line: InvoiceProductLine) {
    const typeInfo = getConfigurationTypeBySlug('revenue-recognition');
    if (!typeInfo) return;
    const ref = this.dialog.open(ConfigurationModalComponent, {
      data: { typeInfo }, width: '480px', maxWidth: '95vw', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadRevenueRecognitions();
      if (typeof result === 'number') {
        line.RevenueRecognitionId = result;
      }
    }
  }

  onCompanyChange() {
    this.selectedCompany = this.companies.find(c => c.Id === this.invoice.CompanyId) || null;
    if (this.selectedCompany) {
      this.invoice.CompanyName = this.selectedCompany.Title;
      this.invoice.CompanyArabicName = this.selectedCompany.ArabicName;
      this.invoice.CompanyAddress = this.selectedCompany.Address;
      this.invoice.CompanyArabicAddress = this.selectedCompany.ArabicAddress;
      this.invoice.CompanyVATNumber = this.selectedCompany.VATNumber;
      this.invoice.LogoPath = this.selectedCompany.LogoPath || this.selectedCompany.LogoUrl;
      this.invoice.StampPath = this.selectedCompany.StampPath;
      this.invoice.CompanyBankName = this.selectedCompany.BankName;
      this.invoice.BankAccountNumber = this.selectedCompany.BankAccountNumber;
      this.invoice.IBAN = this.selectedCompany.IBAN;
      this.invoice.SwiftCode = this.selectedCompany.SwiftCode;
      this.invoice.AccountCurrency = this.selectedCompany.AccountCurrency;
      this.invoice.BeneficiaryName = this.selectedCompany.BeneficiaryName;
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

  hasLineDiscounts(): boolean {
    return this.lines.some(l => (l.DiscountAmount || 0) > 0 || (l.DiscountPercentage || 0) > 0);
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

  filteredProductsForLine(line: InvoiceProductLine): Product[] {
    const term = (line.Description || '').trim().toLowerCase();
    if (!term) return this.products;
    return this.products.filter(p => (p.Title || '').toLowerCase().includes(term));
  }

  openDescDropdown(index: number, event?: FocusEvent) {
    this.openDescDropdownIndex = index;
    const el = event?.target as HTMLElement | undefined;
    if (el) {
      const rect = el.getBoundingClientRect();
      this.descDropdownPos = { top: rect.bottom + 4, left: rect.left, width: rect.width };
    }
  }

  closeDescDropdown() {
    this.openDescDropdownIndex = null;
  }

  selectProductForLine(line: InvoiceProductLine, product: Product) {
    line.ProductId = product.Id;
    this.onProductSelect(line);
    this.closeDescDropdown();
  }

  isLineDropdownOpen(index: number, field: 'account' | 'costCenter' | 'revenueRecognition'): boolean {
    return this.openLineDropdown?.index === index && this.openLineDropdown?.field === field;
  }

  openLineFieldDropdown(index: number, field: 'account' | 'costCenter' | 'revenueRecognition', event: MouseEvent | FocusEvent) {
    this.openLineDropdown = { index, field };
    this.lineDropdownSearch = '';
    const el = (event.currentTarget || event.target) as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.lineDropdownPos = { top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 220) };
  }

  closeLineFieldDropdown() {
    this.openLineDropdown = null;
    this.lineDropdownSearch = '';
  }

  get openLineDropdownCurrentLine(): InvoiceProductLine | null {
    return this.openLineDropdown ? this.lines[this.openLineDropdown.index] : null;
  }

  get lineDropdownCreateLabel(): string {
    const field = this.openLineDropdown?.field;
    if (field === 'account') return '+ Create account';
    if (field === 'costCenter') return '+ Create cost center';
    if (field === 'revenueRecognition') return '+ Create revenue recognition';
    return '+ Create';
  }

  get filteredLineOptions(): ConfigurationItem[] {
    const field = this.openLineDropdown?.field;
    const source = field === 'account' ? this.accounts : field === 'costCenter' ? this.costCenters : this.revenueRecognitions;
    const term = (this.lineDropdownSearch || '').trim().toLowerCase();
    if (!term) return source;
    return source.filter(o => (o.Title || '').toLowerCase().includes(term));
  }

  selectLineOption(line: InvoiceProductLine, option: ConfigurationItem) {
    const field = this.openLineDropdown?.field;
    if (field === 'account') {
      line.AccountId = option.Id;
      this.recalculateLine(line);
    } else if (field === 'costCenter') {
      line.CostCenterId = option.Id;
    } else if (field === 'revenueRecognition') {
      line.RevenueRecognitionId = option.Id;
    }
    this.closeLineFieldDropdown();
  }

  async createLineOption(line: InvoiceProductLine) {
    const field = this.openLineDropdown?.field;
    if (field === 'account') await this.openAddAccount(line);
    else if (field === 'costCenter') await this.openAddCostCenter(line);
    else if (field === 'revenueRecognition') await this.openAddRevenueRecognition(line);
    this.closeLineFieldDropdown();
  }

  getCostCenterTitle(id: number | null | undefined): string {
    return this.costCenters.find(c => c.Id === id)?.Title || '';
  }

  getRevenueRecognitionTitle(id: number | null | undefined): string {
    return this.revenueRecognitions.find(r => r.Id === id)?.Title || '';
  }

  onPricesIncludeTaxChange() {
    this.lines.forEach(l => this.recalculateLine(l, false));
    this.recalculateAll();
  }

  recalculateLine(line: InvoiceProductLine, recalcAll: boolean = true) {
    const qty = line.Quantity || 0;
    const price = line.Price || 0;
    const lineAmount = qty * price;

    let discountAmt = line.DiscountAmount || 0;
    if ((line.DiscountPercentage || 0) > 0) {
      discountAmt = Math.round((lineAmount * (line.DiscountPercentage || 0) / 100) * 100) / 100;
      line.DiscountAmount = discountAmt;
    }

    const amountAfterDiscount = Math.max(0, lineAmount - discountAmt);
    const rate = line.TaxRate || 0;
    let taxable: number, vat: number, total: number;

    if (this.invoice.PricesIncludeTax) {
      taxable = rate > 0 ? Math.round((amountAfterDiscount / (1 + rate / 100)) * 100) / 100 : amountAfterDiscount;
      vat = Math.round((amountAfterDiscount - taxable) * 100) / 100;
      total = amountAfterDiscount;
    } else {
      taxable = amountAfterDiscount;
      vat = Math.round((taxable * rate / 100) * 100) / 100;
      total = taxable + vat;
    }

    line.TaxableAmount = taxable;
    line.VATAmount = vat;
    line.LineTotal = total;

    if (recalcAll) this.recalculateAll();
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
    this.attemptedSave = true;
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
          this.router.navigate(['/invoices/edit', newId], { replaceUrl: true });
          await this.loadInvoice(newId);
          await this.regenerateQr();
        }
      } else {
        this.toastr.error(res?.message || 'Something went wrong');
      }
    } finally {
      this.isSaving = false;
    }
  }

  async regenerateQr() {
    if (!this.invoiceId) return;
    try {
      const res: any = await this.api.GenerateQr(this.invoiceId);
      if (res?.statusCode == 200 && res.data) {
        this.qrImageBase64 = res.data.qrImageBase64 || res.data.QrImageBase64;
      } else {
        this.toastr.error(res?.message || 'Failed to generate QR code');
      }
    } catch (err: any) {
      this.toastr.error('Failed to generate QR code');
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

  ngAfterViewInit() {
    // Observe the panel's rendered width to compute the scale-to-fit factor,
    // and observe the paper's natural (unscaled) height so the surrounding
    // layout reserves exactly the right amount of space.
    if (this.previewPanelEl) {
      this.panelResizeObserver = new ResizeObserver(() => this.updatePreviewScale());
      this.panelResizeObserver.observe(this.previewPanelEl.nativeElement);
    }
    if (this.previewPaperEl) {
      this.paperResizeObserver = new ResizeObserver(() => this.updatePreviewScale());
      this.paperResizeObserver.observe(this.previewPaperEl.nativeElement);
    }
    // Defer the initial calculation: mutating a template-bound value synchronously
    // inside ngAfterViewInit changes it after this view has already been checked
    // in the same cycle, triggering NG0100 (ExpressionChangedAfterItHasBeenCheckedError).
    setTimeout(() => this.updatePreviewScale());
  }

  ngOnDestroy() {
    this.panelResizeObserver?.disconnect();
    this.paperResizeObserver?.disconnect();
    this.onResizeEnd();
  }

  private updatePreviewScale() {
    const panelEl = this.previewPanelEl?.nativeElement;
    const paperEl = this.previewPaperEl?.nativeElement;
    if (!panelEl || !paperEl) return;

    const availableWidth = panelEl.clientWidth - 48; // account for panel padding
    const scale = Math.min(1, Math.max(0.3, availableWidth / this.previewIntrinsicWidth));
    const scaledHeight = paperEl.offsetHeight * scale;

    // Skip no-op updates: without this guard, tiny sub-pixel differences can
    // keep re-triggering the ResizeObservers in a feedback loop, causing the
    // preview to visibly jitter/"vibrate".
    if (Math.abs(scale - this.previewScale) < 0.001 && Math.abs(scaledHeight - this.previewScaledHeight) < 1) {
      return;
    }

    // ResizeObserver callbacks run outside Angular's zone, so re-enter it
    // to make sure the scale/height bindings actually update the view.
    this.ngZone.run(() => {
      this.previewScale = scale;
      this.previewScaledHeight = scaledHeight;
    });
  }

  onResizeStart(event: MouseEvent) {
    this.isResizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.previewPanelWidth;
    document.addEventListener('mousemove', this.onResizeMoveBound);
    document.addEventListener('mouseup', this.onResizeEndBound);
    event.preventDefault();
  }

  private onResizeMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const delta = this.resizeStartX - event.clientX;
    const newWidth = this.resizeStartWidth + delta;
    this.previewPanelWidth = Math.min(this.maxPreviewWidth, Math.max(this.minPreviewWidth, newWidth));
  }

  private onResizeEnd() {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.onResizeMoveBound);
    document.removeEventListener('mouseup', this.onResizeEndBound);
  }

  cancel() {
    this.router.navigate(['/invoices']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showFieldsMenu && !target.closest('.edit-fields-wrap')) {
      this.showFieldsMenu = false;
    }
    if (this.showLineFieldsMenu && !target.closest('.line-edit-fields-wrap')) {
      this.showLineFieldsMenu = false;
    }
    if (this.showAdjustTotal && !target.closest('.adjust-total-wrap')) {
      this.showAdjustTotal = false;
    }
    if (this.showDocMenu && !target.closest('.doc-menu-wrap')) {
      this.showDocMenu = false;
    }
    if (this.showProjectDropdown && !target.closest('.project-combo')) {
      this.closeProjectDropdown();
    }
    if (this.showWarehouseDropdown && !target.closest('.warehouse-combo')) {
      this.closeWarehouseDropdown();
    }
    if (this.showCompanyDropdown && !target.closest('.company-combo')) {
      this.closeCompanyDropdown();
    }
    if (this.showCustomerDropdown && !target.closest('.customer-combo')) {
      this.closeCustomerDropdown();
    }
    if (this.openDescDropdownIndex !== null && !target.closest('.desc-cell')) {
      this.closeDescDropdown();
    }
    if (this.openLineDropdown && !target.closest('.line-select-combo') && !target.closest('.line-dropdown-panel')) {
      this.closeLineFieldDropdown();
    }
  }
}
