import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiService, RiskResponse } from '../services/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Region {
  name: string;
  value: number;
}

interface RiskForm {
  age: number;
  gender: number;
  region: number;
}

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './risk-analysis.html',
  styleUrls: ['./risk-analysis.css']
})
export class RiskAnalysis implements AfterViewInit, OnDestroy {

  /* ================================
     FORM DATA
  ================================ */

  formData: RiskForm = {
    age: 50,
    gender: 1,
    region: 0
  };

  /* ================================
     REGION LIST
  ================================ */

  regions: Region[] = [
    { name: 'North India', value: 0 },
    { name: 'South India', value: 1 },
    { name: 'West India', value: 2 },
    { name: 'East India', value: 3 },
    { name: 'Central India', value: 4 }
  ];

  result: RiskResponse | null = null;
  loading = false;

  private resizeHandler?: () => void;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  /* ================================
     PREDICT RISK
  ================================ */

  predict() {

    if (!this.formData.age || this.formData.age < 1) {
      alert("Please enter a valid age");
      return;
    }

    if (this.formData.gender === undefined || this.formData.region === undefined) {
      alert("Please complete all fields");
      return;
    }

    this.loading = true;
    this.result = null;

    this.api.predictRisk(this.formData).subscribe({

      next: (res) => {
        this.result = res;
        this.loading = false;
      },

      error: (err) => {
        console.error('Prediction error:', err);
        alert("Prediction failed. Please try again.");
        this.loading = false;
      }

    });

  }

  /* ================================
     GO TO RECOMMENDATION PAGE
  ================================ */

  goToRecommendation() {

    if (!this.result) {
      alert("Run risk analysis first");
      return;
    }

    this.router.navigate(['/app/recommendations'], {
      state: {
        risk: this.result.risk_level,
        age: this.formData.age,
        gender: this.formData.gender,
        region: this.getRegionName()
      }
    });

  }

  /* ================================
     GET REGION NAME
  ================================ */

  getRegionName(): string {
    const region = this.regions.find(r => r.value === this.formData.region);
    return region ? region.name : 'Unknown';
  }

  /* ================================
     NETWORK BACKGROUND ANIMATION
  ================================ */

  ngAfterViewInit() {

    const canvas = document.getElementById('networkCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    this.resizeHandler = resizeCanvas;
    window.addEventListener('resize', resizeCanvas);

    const nodes: NodePoint[] = [];

    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    const animate = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {

          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = 'rgba(56,189,248,0.15)';
            ctx.stroke();
          }

        }
      }

      requestAnimationFrame(animate);

    };

    animate();
  }

  /* ================================
     CLEANUP
  ================================ */

  ngOnDestroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

}