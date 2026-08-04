import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { InvoiceApiService } from '../../../../../services/invoice-api.service';
import { Project, ProjectDocument } from '../../../../shared/models/invoice.model';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatFormFieldModule],
  templateUrl: './project-modal.component.html',
  styleUrl: './project-modal.component.css'
})
export class ProjectModalComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  projectModel: Project = {
    Title: '',
    IsActive: true
  };
  selectedId: number | null = null;
  isSaving: boolean = false;
  isUploading: boolean = false;

  documents: ProjectDocument[] = [];
  pendingFiles: File[] = [];

  get attachmentCount(): number {
    return this.documents.length + this.pendingFiles.length;
  }

  constructor(
    private api: InvoiceApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProjectModalComponent>
  ) {
    this.selectedId = data || null;
  }

  ngOnInit(): void {
    if (this.selectedId) {
      this.loadProject(this.selectedId);
      this.loadDocuments(this.selectedId);
    }
  }

  async loadProject(id: number) {
    const res: any = await this.api.GetProject({ Id: id });
    if (res?.statusCode == 200 && res.data?.length) {
      this.projectModel = res.data[0];
    }
  }

  async loadDocuments(projectId: number) {
    const res: any = await this.api.GetProjectDocument(projectId);
    if (res?.statusCode == 200 && res.data) {
      this.documents = res.data;
    }
  }

  triggerFileSelect() {
    this.fileInput?.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) return;

    if (this.selectedId) {
      this.isUploading = true;
      try {
        for (const file of files) {
          const res: any = await this.api.UploadProjectDocument(this.selectedId, file);
          if (res?.statusCode == 200) {
            await this.loadDocuments(this.selectedId);
          } else {
            this.toastr.error(res?.message || 'Upload failed');
          }
        }
      } finally {
        this.isUploading = false;
      }
    } else {
      this.pendingFiles.push(...files);
    }
  }

  removePendingFile(index: number) {
    this.pendingFiles.splice(index, 1);
  }

  async removeDocument(doc: ProjectDocument) {
    if (!doc.Id) return;
    const res: any = await this.api.DeleteProjectDocument(doc.Id);
    if (res?.statusCode == 200) {
      this.documents = this.documents.filter(d => d.Id !== doc.Id);
    } else {
      this.toastr.error(res?.message || 'Failed to remove document');
    }
  }

  isValid(): boolean {
    return !!(this.projectModel.Title && this.projectModel.Title.trim().length > 0);
  }

  async onSubmit() {
    if (!this.isValid()) {
      this.toastr.error('Project name is required');
      return;
    }
    this.isSaving = true;
    try {
      const res: any = await this.api.InsertUpdateProject(this.projectModel);
      if (res?.statusCode == 200) {
        const newId = res.data?.Id ?? this.selectedId;

        if (newId && this.pendingFiles.length) {
          for (const file of this.pendingFiles) {
            await this.api.UploadProjectDocument(newId, file);
          }
          this.pendingFiles = [];
        }

        this.toastr.success(this.selectedId ? 'Project updated successfully' : 'Project added successfully');
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
