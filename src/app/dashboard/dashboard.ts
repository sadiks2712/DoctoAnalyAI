import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, SummaryResponse } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {

  alerts: any[] = [];

  regions = [
    { name: 'North India', value: 0 },
    { name: 'South India', value: 1 },
    { name: 'West India', value: 2 },
    { name: 'East India', value: 3 },
    { name: 'Central India', value: 4 }
  ];

  animatedTotal = 0;
  animatedAvgAge = 0;
  animatedHighRisk = 0;

  selectedDisease: string | null = null;
  selectedRegion: string | null = null;

  private refreshInterval: any;
  private dataListener!: () => void;

  summary: SummaryResponse = {
    total_records: 0,
    avg_age: 0,
    high_risk: 0
  };

  loading = true;
  noData = false;
  warningMessage = '';

  diseaseChartData?: ChartConfiguration<'pie'>['data'];
  diseaseChartType: 'pie' = 'pie';

  regionChartData?: ChartConfiguration<'bar'>['data'];
  regionChartType: 'bar' = 'bar';

  diseaseChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  regionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSummary();

    this.refreshInterval = setInterval(() => {
      this.loadSummary();
    }, 30000);

    this.dataListener = () => this.loadSummary();
    window.addEventListener('dataUpdated', this.dataListener);
  }

  ngOnDestroy() {
    window.removeEventListener('dataUpdated', this.dataListener);

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadSummary() {

    this.loading = true;

    this.api.getSummary().subscribe({

      next: (data) => {

        console.log("SUMMARY API:", data);

        this.summary = data || {
          total_records: 0,
          avg_age: 0,
          high_risk: 0
        };

        this.animatedTotal = Number(this.summary.total_records ?? 0);
        this.animatedAvgAge = Math.round(Number(this.summary.avg_age ?? 0));
        this.animatedHighRisk = Number(this.summary.high_risk ?? 0);

        this.prepareCharts(data);

        this.loading = false;
      },

      error: () => {
        this.warningMessage = "Failed to load dashboard data";
        this.loading = false;
      }
    });
  }

  onDiseaseClick(disease: string) {

    this.selectedDisease = disease;
    this.selectedRegion = null;

    this.api.getSummary(undefined, undefined, undefined, disease)
      .subscribe(res => this.prepareCharts(res));
  }

  onRegionClick(region: string) {

    this.selectedRegion = region;
    this.selectedDisease = null;

    const regionValue =
      this.regions.find(r => r.name === region)?.value;

    if (regionValue !== undefined) {
      this.api.getSummary(undefined, undefined, regionValue)
        .subscribe(res => this.prepareCharts(res));
    }
  }

  resetFilters() {
    this.selectedDisease = null;
    this.selectedRegion = null;
    this.loadSummary();
  }

  prepareCharts(data: any) {

    const diseaseCounts = data?.disease_counts || {};
    const regionCounts = data?.region_distribution || {};

    const diseaseLabels = Object.keys(diseaseCounts);
    const diseaseValues = Object.values(diseaseCounts).map(v => Number(v));

    const regionLabels = Object.keys(regionCounts).map(key => {
      const num = Number(key);
      return this.regions.find(r => r.value === num)?.name || key;
    });

    const regionValues = Object.values(regionCounts).map(v => Number(v));

    this.diseaseChartData = {
      labels: diseaseLabels,
      datasets: [{
        data: diseaseValues,
        backgroundColor: [
          '#3b82f6',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#8b5cf6'
        ]
      }]
    };

    this.regionChartData = {
      labels: regionLabels,
      datasets: [{
        label: 'Cases by Region',
        data: regionValues,
        backgroundColor: '#3b82f6'
      }]
    };
  }

  async downloadPDF() {

    const element = document.getElementById('dashboard-report');
    if (!element) return;

    const canvas = await html2canvas(element);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    pdf.addImage(imgData, 'PNG', 0, 10, 210, 150);
    pdf.save("healthcare-dashboard.pdf");
  }
}