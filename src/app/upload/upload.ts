import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [],
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

  // File selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.message = '';
    }
  }

  // Upload dataset
  upload() {

    if (!this.selectedFile) {
      this.message = '⚠️ Please select a CSV file first';
      return;
    }

    // CSV validation
    if (!this.selectedFile.name.toLowerCase().endsWith('.csv')) {
      this.message = '⚠️ Only CSV files are allowed';
      return;
    }

    this.loading = true;
    this.showSuccess = false;
    this.message = 'Uploading dataset...';

    this.api.uploadDataset(this.selectedFile).subscribe({

      next: (res: any) => {

        console.log('Upload response:', res);

        this.loading = false;
        this.showSuccess = true;
        this.message = '✅ Dataset uploaded successfully';

        // notify other components
        window.dispatchEvent(new Event('dataUpdated'));

        // redirect after animation
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 1600);
      },

      error: (err) => {

        console.error('Upload error:', err);

        this.loading = false;
        this.showSuccess = false;
        this.message = '❌ Upload failed. Please try again.';
      }

    });

  }

}