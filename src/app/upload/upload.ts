import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.html',
  styleUrls: ['./upload.css']
})
export class UploadComponent {
showSuccess = false;
  selectedFile: File | null = null;
  message = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  // ✅ strongly typed event
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.message = '';
    }
  }

  // ✅ professional upload flow
 upload() {
  if (!this.selectedFile) {
    this.message = '⚠️ Please select a CSV file first';
    return;
  }

  // ✅ file type validation
  if (!this.selectedFile.name.toLowerCase().endsWith('.csv')) {
    this.message = '⚠️ Only CSV files are allowed';
    return;
  }

  this.loading = true;
  this.showSuccess = false;
  this.message = 'Uploading dataset...';

  this.api.uploadDataset(this.selectedFile).subscribe({
    next: (res: any) => {
      console.log('Upload response:', res); // ⭐ IMPORTANT DEBUG

      this.loading = false;
      this.showSuccess = true;
      this.message = '✅ Dataset uploaded successfully';

      // notify dashboard
      window.dispatchEvent(new Event('dataUpdated'));

      // redirect after animation
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1600);
    },

    error: (err) => {
      console.error('Upload error:', err);
      this.loading = false;
      this.showSuccess = false;
      this.message = '❌ Upload failed. Please try again.';
    }
  });
}}