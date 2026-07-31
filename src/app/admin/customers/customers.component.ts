import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomerApiService } from '../../../services/customer-api.service';
import { CustomerModalComponent } from './customer-modal/customer-modal.component';
import { DeletePopupComponent } from '../../shared/delete-popup/delete-popup.component';
import { Customer } from '../../shared/models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {
  customers: Customer[] = [];
  isLoading: boolean = false;

  searchText: string = '';
  statusFilter: string = '';

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  private searchDebounce: any;

  constructor(private api: CustomerApiService, private toastr: ToastrService, private dialog: MatDialog) { }

  ngOnInit() {
    this.GetCustomer();
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

  async GetCustomer() {
    this.isLoading = true;
    try {
      const params: any = {
        PageNumber: this.pageNumber,
        PageSize: this.pageSize
      };
      if (this.searchText) params.SearchText = this.searchText;
      if (this.statusFilter !== '') params.IsActive = this.statusFilter === 'true';

      const res: any = await this.api.GetCustomer(params);
      if (res?.data) {
        this.customers = res.data;
        this.totalRecords = res.data.length ? res.data[0].TotalRecords : 0;
      } else {
        this.customers = [];
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
      this.GetCustomer();
    }, 350);
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.GetCustomer();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.GetCustomer();
  }

  openAddEditModal(id?: number) {
    let dialogRef = this.dialog.open(CustomerModalComponent, {
      data: id,
      width: '900px',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetCustomer();
      }
    });
  }

  openDeleteModal(id: number) {
    let dialogRef = this.dialog.open(DeletePopupComponent, {
      data: id, width: '530px',
    });
    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result?.Id) {
        await this.deleteCustomer(result.Id);
      }
    });
  }

  async deleteCustomer(id: number) {
    const res: any = await this.api.DeleteCustomer(id);
    if (res?.statusCode == 200) {
      this.toastr.success('Deleted Successfully');
      if (this.customers.length === 1 && this.pageNumber > 1) {
        this.pageNumber--;
      }
      this.GetCustomer();
    } else {
      this.toastr.error('Something went wrong');
    }
  }
}
