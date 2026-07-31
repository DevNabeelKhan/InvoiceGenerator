import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationApiService } from '../../../../services/configuration-api.service';
import { ConfigurationItem, ConfigurationTypeInfo } from '../../../shared/models/configuration.model';

@Component({
  selector: 'app-configuration-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './configuration-modal.component.html',
  styleUrl: './configuration-modal.component.css'
})
export class ConfigurationModalComponent {
  typeInfo: ConfigurationTypeInfo;
  selectedId: number | null = null;
  isSaving: boolean = false;

  itemModel: ConfigurationItem = {
    Title: '',
    IsActive: true
  };

  constructor(
    private api: ConfigurationApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { id?: number; typeInfo: ConfigurationTypeInfo },
    public dialogRef: MatDialogRef<ConfigurationModalComponent>
  ) {
    this.typeInfo = data.typeInfo;
    this.selectedId = data.id || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadItem(this.selectedId);
    }
  }

  async loadItem(id: number) {
    const res: any = await this.api.GetConfiguration(this.typeInfo.tableName, { Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.itemModel = res.data[0];
    }
  }

  isValid(): boolean {
    return !!(this.itemModel.Title && this.itemModel.Title.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error(`${this.typeInfo.singular} title is required`);
      return;
    }
    this.isSaving = true;
    try {
      const payload: ConfigurationItem = { Id: this.selectedId, Title: this.itemModel.Title, IsActive: this.itemModel.IsActive };
      const res: any = await this.api.InsertUpdateConfiguration(this.typeInfo.tableName, payload);
      if (res?.statusCode == 200) {
        this.toastr.success(this.selectedId ? `${this.typeInfo.singular} updated successfully` : `${this.typeInfo.singular} added successfully`);
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
