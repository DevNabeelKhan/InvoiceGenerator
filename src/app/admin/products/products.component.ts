import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ProductApiService } from '../../../services/product-api.service';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { DeletePopupComponent } from '../../shared/delete-popup/delete-popup.component';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: Product[] = [];
  isLoading: boolean = false;

  searchText: string = '';
  statusFilter: string = '';

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  private searchDebounce: any;

  constructor(private api: ProductApiService, private toastr: ToastrService, private dialog: MatDialog) { }

  ngOnInit() {
    this.GetProduct();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.pageNumber;
    const window = 2;
    const pages: number[] = [];
    for (let p = Math.max(1, current - window); p <= Math.min(total, current + window); p++) {
      pages.push(p);
    }
    return pages;
  }

  async GetProduct() {
    this.isLoading = true;
    try {
      const params: any = {
        PageNumber: this.pageNumber,
        PageSize: this.pageSize
      };
      if (this.searchText) params.SearchText = this.searchText;
      if (this.statusFilter !== '') params.IsActive = this.statusFilter === 'true';

      const res: any = await this.api.GetProduct(params);
      if (res?.data) {
        this.products = res.data;
        this.totalRecords = res.data.length ? res.data[0].TotalRecords : 0;
      } else {
        this.products = [];
        this.totalRecords = 0;
      }
    } catch (error) {
      console.error('API error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearchChange() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.pageNumber = 1;
      this.GetProduct();
    }, 350);
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.GetProduct();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.GetProduct();
  }

  openAddEditModal(id?: number) {
    let dialogRef = this.dialog.open(ProductModalComponent, {
      data: id,
      width: '900px',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetProduct();
      }
    });
  }

  openDeleteModal(id: number) {
    let dialogRef = this.dialog.open(DeletePopupComponent, {
      data: id, width: '530px',
    });
    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result?.Id) {
        await this.deleteProduct(result.Id);
      }
    });
  }

  async deleteProduct(id: number) {
    const res: any = await this.api.DeleteProduct(id);
    if (res?.statusCode == 200) {
      this.toastr.success('Deleted Successfully');
      if (this.products.length === 1 && this.pageNumber > 1) {
        this.pageNumber--;
      }
      this.GetProduct();
    } else {
      this.toastr.error('Something went wrong');
    }
  }
}
