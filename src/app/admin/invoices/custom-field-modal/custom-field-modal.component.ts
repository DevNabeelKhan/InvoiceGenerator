import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { CustomField } from '../../../shared/models/custom-field.model';

@Component({
  selector: 'app-custom-field-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './custom-field-modal.component.html',
  styleUrl: './custom-field-modal.component.css'
})
export class CustomFieldModalComponent {
  showArabicName = false;
  isSaving = false;

  field: CustomField = {
    Id: 0,
    Name: '',
    ArabicName: '',
    AppliesTo: { sales: true, purchases: false, contacts: false },
    FieldLevel: 'Document',
    FieldType: '',
    Visible: true
  };

  fieldTypes = ['Text', 'Number', 'Date', 'Dropdown', 'Checkbox'];

  constructor(
    public dialogRef: MatDialogRef<CustomFieldModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  isValid(): boolean {
    return !!(this.field.Name && this.field.Name.trim().length > 0 && this.field.FieldType);
  }

  onSubmit() {
    if (!this.isValid()) return;
    this.dialogRef.close(this.field);
  }

  cancel() {
    this.dialogRef.close();
  }
}
