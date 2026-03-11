import { Component, AfterViewInit } from '@angular/core';
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
export class RiskAnalysis implements AfterViewInit {

  formData = {
    age: 50,
    gender: 1,
    region: 0
  };

  regions = [
    { name: 'North India', value: 0 },
    { name: 'South India', value: 1 },
    { name: 'West India', value: 2 },
    { name: 'East India', value: 3 },
    { name: 'Central India', value: 4 }
  ];

  result: { high_risk: boolean; risk_probability: number } | null = null;

  loading = false;

  constructor(private api: ApiService) {}

  predict() {

    if (!this.formData.age || this.formData.age <= 0) {
      alert("Please enter a valid age greater than 0");
      return;
    }

    this.loading = true;
    this.result = null;

    this.api.predictRisk(this.formData).subscribe({

      next: (res: any) => {
        this.result = res;
        this.loading = false;
      },

      error: (err) => {
        console.error("Prediction error:", err);
        alert("Failed to predict risk. Please try again.");
        this.loading = false;
      }

    });
  }

  getRegionName() {
    const region = this.regions.find(r => r.value === this.formData.region);
    return region ? region.name : 'Unknown';
  }

  ngAfterViewInit() {

    const canvas = document.getElementById('networkCanvas') as HTMLCanvasElement;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return; // Added safety check for context

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: any[] = [];

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
        ctx.fillStyle = "#38bdf8";
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

            ctx.strokeStyle = "rgba(56,189,248,0.15)";
            ctx.stroke();

          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

}