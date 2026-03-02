import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ApiService, MultiTrendPoint } from '../services/api';

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './trends.html',
  styleUrls: ['./trends.css']
})
export class Trends implements OnInit, OnDestroy {

  loading = true;
  intervalId: any;

  // 🔽 FILTER STATE
  selectedDisease: string = '';
  diseaseList: string[] = [];

  trendChartType: 'line' = 'line';

  // ✅ CHART OPTIONS (IMPORTANT)
  trendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148,163,184,0.15)' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148,163,184,0.15)' }
      }
    }
  };

  trendChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  // 🎨 color palette
  private colors = [
    '#38bdf8',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6'
  ];

  constructor(private api: ApiService) {}

  // ===============================
  // 🚀 INIT
  // ===============================
  ngOnInit() {
    this.loadTrends();

    // 🔄 real-time refresh
    this.intervalId = setInterval(() => {
      this.loadTrends();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // ===============================
  // 🔄 FILTER CHANGE
  // ===============================
  onDiseaseChange() {
    this.loadTrends();
  }

  // ===============================
  // 🚀 LOAD DATA
  // ===============================
  loadTrends() {
    this.loading = true;

    this.api.getDiseaseTrends(this.selectedDisease || undefined)
      .subscribe({
        next: (res: MultiTrendPoint[]) => {

          // ✅ SAFETY CHECK
          if (!Array.isArray(res)) {
            console.error('Trends API returned non-array:', res);
            this.resetChart();
            this.loading = false;
            return;
          }

          // ✅ EMPTY DATA HANDLING
          if (res.length === 0) {
            this.resetChart();
            this.diseaseList = [];
            this.loading = false;
            return;
          }

          // build dropdown
          this.diseaseList = [...new Set(res.map(r => r.disease))];

          this.buildMultiDataset(res);
          this.loading = false;
        },
        error: (err) => {
          console.error('Trend error:', err);
          this.resetChart();
          this.loading = false;
        }
      });
  }

  // ===============================
  // 🧠 BUILD CHART
  // ===============================
  buildMultiDataset(data: MultiTrendPoint[]) {

    const labels = [...new Set(data.map(d => d.date))];
    const diseases = [...new Set(data.map(d => d.disease))];

    const datasets = diseases.map((disease, index) => {
      const diseaseData = labels.map(label => {
        const match = data.find(
          d => d.date === label && d.disease === disease
        );
        return match ? match.cases : 0;
      });

      return {
        label: disease,
        data: diseaseData,
        tension: 0.4,
        fill: false,
        borderColor: this.colors[index % this.colors.length],
        pointRadius: 3
      };
    });

    // ✅ IMPORTANT: assign NEW object (forces chart refresh)
    this.trendChartData = {
      labels: [...labels],
      datasets: [...datasets]
    };
  }

  // ===============================
  // 🧹 RESET CHART (NEW)
  // ===============================
  private resetChart() {
    this.trendChartData = {
      labels: [],
      datasets: []
    };
  }
}