import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { ProductApiService } from '../../../../services/product-api.service';
import { Product } from '../../../shared/models/product.model';

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
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;

  constructor(
    private api: ProductApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadProduct(this.selectedId);
    }
  }

  async loadProduct(id: number) {
    const res: any = await this.api.GetProduct({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.productModel = res.data[0];
    }
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
