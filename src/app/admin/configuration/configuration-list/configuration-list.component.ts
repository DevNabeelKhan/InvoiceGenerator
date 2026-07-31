import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationApiService } from '../../../../services/configuration-api.service';
import { ConfigurationModalComponent } from '../configuration-modal/configuration-modal.component';
import { DeletePopupComponent } from '../../../shared/delete-popup/delete-popup.component';
import { ConfigurationItem, ConfigurationTypeInfo, getConfigurationTypeBySlug } from '../../../shared/models/configuration.model';

@Component({
  selector: 'app-configuration-list',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './configuration-list.component.html',
  styleUrl: './configuration-list.component.css'
})
export class ConfigurationListComponent {
  typeInfo: ConfigurationTypeInfo | undefined;

  items: ConfigurationItem[] = [];
  isLoading: boolean = false;

  searchText: string = '';
  statusFilter: string = '';

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  private searchDebounce: any;

  constructor(
    private route: ActivatedRoute,
    private api: ConfigurationApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('type');
      this.typeInfo = getConfigurationTypeBySlug(slug);
      this.pageNumber = 1;
      this.searchText = '';
      this.statusFilter = '';
      if (this.typeInfo) {
        this.GetList();
      }
    });
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

  async GetList() {
    if (!this.typeInfo) return;
    this.isLoading = true;
    try {
      const params: any = {
        PageNumber: this.pageNumber,
        PageSize: this.pageSize
      };
      if (this.searchText) params.SearchText = this.searchText;
      if (this.statusFilter !== '') params.IsActive = this.statusFilter === 'true';

      const res: any = await this.api.GetConfiguration(this.typeInfo.tableName, params);
      if (res?.data) {
        this.items = res.data;
        this.totalRecords = res.data.length ? res.data[0].TotalRecords : 0;
      } else {
        this.items = [];
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
      this.GetList();
    }, 350);
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.GetList();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.GetList();
  }

  openAddEditModal(id?: number) {
    if (!this.typeInfo) return;
    let dialogRef = this.dialog.open(ConfigurationModalComponent, {
      data: { id, typeInfo: this.typeInfo },
      width: '520px',
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetList();
      }
    });
  }

  openDeleteModal(id: number) {
    let dialogRef = this.dialog.open(DeletePopupComponent, {
      data: id, width: '530px',
    });
    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result?.Id) {
        await this.deleteItem(result.Id);
      }
    });
  }

  async deleteItem(id: number) {
    if (!this.typeInfo) return;
    const res: any = await this.api.DeleteConfiguration(this.typeInfo.tableName, id);
    if (res?.statusCode == 200) {
      this.toastr.success('Deleted Successfully');
      if (this.items.length === 1 && this.pageNumber > 1) {
        this.pageNumber--;
      }
      this.GetList();
    } else {
      this.toastr.error('Something went wrong');
    }
  }
}
