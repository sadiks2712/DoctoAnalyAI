import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  Chart,
  registerables
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {

  // =========================
  // REGION MAP
  // =========================
  regions = [
    { name: 'North India', value: 0 },
    { name: 'South India', value: 1 },
    { name: 'West India', value: 2 },
    { name: 'East India', value: 3 },
    { name: 'Central India', value: 4 }
  ];

  // =========================
  // KPI VALUES
  // =========================
  animatedTotal = 0;
  animatedAvgAge = 0;
  animatedHighRisk = 0;

  // =========================
  // DRILL STATE
  // =========================
  selectedDisease: string | null = null;
  selectedRegion: string | null = null;

  // =========================
  // REFRESH HANDLERS
  // =========================
  private refreshInterval: any;
  private dataListener!: () => void;

  summary: any = {};
  loading = true;
  noData = false;
  warningMessage = '';

  // =========================
  // CHART DATA
  // =========================
  diseaseChartData?: ChartConfiguration<'pie'>['data'];
  diseaseChartType: 'pie' = 'pie';

  regionChartData?: ChartConfiguration<'bar'>['data'];
  regionChartType: 'bar' = 'bar';

  // =========================
  // CHART OPTIONS
  // =========================
  diseaseChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}`
        }
      }
    },
    onClick: (_, elements, chart) => {
      if (elements?.length) {
        const index = elements[0].index;
        const label = chart.data.labels?.[index] as string;
        this.onDiseaseClick(label);
      }
    }
  };

  regionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    },
    onClick: (_, elements, chart) => {
      if (elements?.length) {
        const index = elements[0].index;
        const label = chart.data.labels?.[index] as string;
        this.onRegionClick(label);
      }
    }
  };

  constructor(private api: ApiService) {}

  // =========================
  // INIT
  // =========================
  ngOnInit() {

    this.loadSummary();

    // auto refresh every 30 sec
    this.refreshInterval = setInterval(() => {
      this.loadSummary();
    }, 30000);

    // refresh after dataset upload
    this.dataListener = () => this.loadSummary();
    window.addEventListener('dataUpdated', this.dataListener);

  }

  // =========================
  // DESTROY
  // =========================
  ngOnDestroy() {

    window.removeEventListener('dataUpdated', this.dataListener);

    if (this.refreshInterval)
      clearInterval(this.refreshInterval);

  }

  // =========================
  // LOAD SUMMARY
  // =========================
  loadSummary() {

    this.loading = true;
    this.noData = false;
    this.warningMessage = '';

    this.api.getSummary().subscribe({

      next: (data) => {

        this.summary = data || {};

        // animate KPIs
        this.animateValue(
          this.animatedTotal,
          Number(this.summary?.total_records || 0),
          800,
          v => this.animatedTotal = v
        );

        this.animateValue(
          this.animatedAvgAge,
          Math.round(Number(this.summary?.avg_age || 0)),
          800,
          v => this.animatedAvgAge = v
        );

        this.animateValue(
          this.animatedHighRisk,
          Number(this.summary?.high_risk || 0),
          800,
          v => this.animatedHighRisk = v
        );

        this.prepareCharts(this.summary);

        this.loading = false;

      },

      error: (err) => {

        console.error('API error:', err);

        this.warningMessage = 'Failed to load dashboard data.';
        this.loading = false;
        this.noData = true;

      }

    });

  }

  // =========================
  // DISEASE DRILL
  // =========================
  onDiseaseClick(disease: string) {

    if (!disease) return;

    this.selectedDisease = disease;
    this.selectedRegion = null;

    this.api.getSummary(undefined, undefined, undefined, disease)
      .subscribe(res => this.prepareCharts(res));

  }

  // =========================
  // REGION DRILL
  // =========================
  onRegionClick(region: string) {

    if (!region) return;

    this.selectedRegion = region;
    this.selectedDisease = null;

    // convert region name → region number
    const regionValue = this.regions.find(r => r.name === region)?.value;

    if (regionValue !== undefined) {
      this.api.getSummary(undefined, undefined, regionValue)
        .subscribe(res => this.prepareCharts(res));
    }

  }

  // =========================
  // RESET FILTERS
  // =========================
  resetFilters() {

    this.selectedDisease = null;
    this.selectedRegion = null;

    this.loadSummary();

  }

  // =========================
  // PREPARE CHARTS
  // =========================
  prepareCharts(data: any) {

    if (!data) return;

    const diseaseCounts = data?.disease_counts || {};
    const regionCounts = data?.region_distribution || {};

    const diseaseLabels = Object.keys(diseaseCounts);
    const diseaseValues = Object.values(diseaseCounts).map(Number);

    // Map region numbers to names for labels
    const regionLabels = Object.keys(regionCounts).map(key => {
      const num = Number(key);
      return this.regions.find(r => r.value === num)?.name || key;
    });
    const regionValues = Object.values(regionCounts).map(Number);

    // disease pie chart
    this.diseaseChartData = diseaseLabels.length
      ? {
          labels: diseaseLabels,
          datasets: [{
            data: diseaseValues,
            backgroundColor: [
              '#3b82f6',
              '#ef4444',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#06b6d4'
            ]
          }]
        }
      : undefined;

    // region bar chart
    this.regionChartData = regionLabels.length
      ? {
          labels: regionLabels,
          datasets: [{
            label: 'Cases by Region',
            data: regionValues,
            backgroundColor: '#3b82f6'
          }]
        }
      : undefined;

    if (!diseaseLabels.length && !regionLabels.length) {

      this.noData = true;

      this.warningMessage =
        'Dataset uploaded but no categorical columns found for charts.';
    }

  }

  // =========================
  // DOWNLOAD PDF
  // =========================
  async downloadPDF() {

    const element = document.getElementById('dashboard-report');

    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    } as any);

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);

    pdf.save('healthcare-report.pdf');

  }

  // =========================
  // KPI ANIMATION
  // =========================
  animateValue(
    start: number,
    end: number,
    duration: number,
    setter: (val: number) => void
  ) {

    const startTime = performance.now();

    const update = (currentTime: number) => {

      const progress = Math.min((currentTime - startTime) / duration, 1);

      const value = Math.floor(progress * (end - start) + start);

      setter(value);

      if (progress < 1)
        requestAnimationFrame(update);

    };

    requestAnimationFrame(update);

  }

}