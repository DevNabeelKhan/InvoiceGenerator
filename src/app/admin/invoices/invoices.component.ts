import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../services/invoice-api.service';
import { DeletePopupComponent } from '../../shared/delete-popup/delete-popup.component';
import { Invoice } from '../../shared/models/invoice.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent {
  invoices: Invoice[] = [];
  isLoading: boolean = false;

  searchText: string = '';
  statusFilter: string = '';

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  private searchDebounce: any;

  constructor(private api: InvoiceApiService, private toastr: ToastrService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.GetInvoice();
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

  async GetInvoice() {
    this.isLoading = true;
    try {
      const params: any = {
        PageNumber: this.pageNumber,
        PageSize: this.pageSize
      };
      if (this.searchText) params.SearchText = this.searchText;
      if (this.statusFilter !== '') params.Status = this.statusFilter;

      const res: any = await this.api.GetInvoice(params);
      if (res?.data) {
        this.invoices = res.data;
        this.totalRecords = res.data.length ? res.data[0].TotalRecords : 0;
      } else {
        this.invoices = [];
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
      this.GetInvoice();
    }, 350);
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.GetInvoice();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.GetInvoice();
  }

  createInvoice() {
    this.router.navigate(['/invoices/new']);
  }

  editInvoice(id: number) {
    this.router.navigate(['/invoices/edit', id]);
  }

  downloadPdf(id: number) {
    const url = this.api.getDownloadPdfUrl(id);
    window.open(url, '_blank');
  }

  openDeleteModal(id: number) {
    let dialogRef = this.dialog.open(DeletePopupComponent, {
      data: id, width: '530px',
    });
    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result?.Id) {
        await this.deleteInvoice(result.Id);
      }
    });
  }

  async deleteInvoice(id: number) {
    const res: any = await this.api.DeleteInvoice(id);
    if (res?.statusCode == 200) {
      this.toastr.success('Deleted Successfully');
      if (this.invoices.length === 1 && this.pageNumber > 1) {
        this.pageNumber--;
      }
      this.GetInvoice();
    } else {
      this.toastr.error('Something went wrong');
    }
  }

  statusBadgeClass(status?: string | null): string {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'active';
      case 'sent': return 'active';
      case 'cancelled': return 'inactive';
      default: return 'inactive';
    }
  }
}
