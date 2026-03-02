import { Component } from '@angular/core';
import { ApiService } from '../services/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './risk-analysis.html',
  styleUrls: ['./risk-analysis.css']
})
export class RiskAnalysis {

  formData = {
    age: 50,
    gender: 1,
    region: 0
  };

  result: any;
  loading = false;

  constructor(private api: ApiService) {}

  predict() {
    this.loading = true;
    this.result = null;

    this.api.predictRisk(this.formData).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Prediction error:', err);
        this.loading = false;
      }
    });
  }
}