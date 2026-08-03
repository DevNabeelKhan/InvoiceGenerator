import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ProductApiService } from '../../../../services/product-api.service';
import { ConfigurationApiService } from '../../../../services/configuration-api.service';
import { Product } from '../../../shared/models/product.model';
import { ConfigurationItem, CONFIGURATION_TYPES, getConfigurationTypeBySlug } from '../../../shared/models/configuration.model';
import { ConfigurationModalComponent } from '../../configuration/configuration-modal/configuration-modal.component';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css'
})
export class ProductModalComponent {
  productModel: Product = {
    Title: '',
    ServiceCode: '',
    ServiceDescription: '',
    SellingPrice: null,
    PurchaseCost: null,
    UnitOfMeasureId: null,
    RevenueAccountID: null,
    RevenueTaxRateId: null,
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;

  units: ConfigurationItem[] = [];
  accounts: ConfigurationItem[] = [];
  taxRates: ConfigurationItem[] = [];

  constructor(
    private api: ProductApiService,
    private configApi: ConfigurationApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    this.loadLookups();
    if (this.selectedId) {
      this.loadProduct(this.selectedId);
    }
  }

  async loadLookups() {
    const [unitsRes, accountsRes, taxRatesRes]: any[] = await Promise.all([
      this.configApi.GetConfiguration('UnitOfMeasure', { IsActive: true, PageSize: 1000 }),
      this.configApi.GetConfiguration('AccountType', { IsActive: true, PageSize: 1000 }),
      this.configApi.GetConfiguration('RevenueTaxRateType', { IsActive: true, PageSize: 1000 })
    ]);
    if (unitsRes?.statusCode == 200) this.units = unitsRes.data || [];
    if (accountsRes?.statusCode == 200) this.accounts = accountsRes.data || [];
    if (taxRatesRes?.statusCode == 200) this.taxRates = taxRatesRes.data || [];
  }

  async loadProduct(id: number) {
    const res: any = await this.api.GetProduct({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.productModel = res.data[0];
    }
  }

  async quickAdd(slug: string, target: 'units' | 'accounts' | 'taxRates', assign: (id: number) => void) {
    const typeInfo = getConfigurationTypeBySlug(slug);
    if (!typeInfo) return;
    const ref = this.dialog.open(ConfigurationModalComponent, {
      data: { typeInfo }, width: '480px', disableClose: true
    });
    const result: any = await firstValueFrom(ref.afterClosed());
    if (result) {
      await this.loadLookups();
      if (typeof result === 'number') {
        assign(result);
      }
    }
  }

  addUnit() {
    this.quickAdd('unit-of-measure', 'units', (id) => this.productModel.UnitOfMeasureId = id);
  }

  addAccount() {
    this.quickAdd('account-type', 'accounts', (id) => this.productModel.RevenueAccountID = id);
  }

  addTaxRate() {
    this.quickAdd('revenue-tax-rate-type', 'taxRates', (id) => this.productModel.RevenueTaxRateId = id);
  }

  isValid(): boolean {
    return !!(this.productModel.Title && this.productModel.Title.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Product Name is required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateProduct(this.productModel);
      if (res?.statusCode == 200) {
        this.toastr.success(this.selectedId ? 'Product updated successfully' : 'Product added successfully');
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
