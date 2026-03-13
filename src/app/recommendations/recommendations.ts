import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.css']
})
export class Recommendations implements OnInit, AfterViewInit {

  risk: string = '';
  age: number = 0;
  gender: number = 0;
  region: string = '';

  healthScore: number = 0;
  animatedScore: number = 0;

  exercise: string = '';
  diet: string = '';
  sleep: string = '';
  tests: string = '';

  constructor() {

    const state = history.state || {};

    this.risk = (state.risk || '').toUpperCase();
    this.age = state.age || 0;
    this.gender = state.gender || 0;
    this.region = state.region || 'Unknown';

  }

  ngOnInit() {

    this.generateRecommendations();
    this.animateHealthScore();

  }

  ngAfterViewInit() {

    this.startNetworkAnimation();

  }

  generateRecommendations() {

    if (this.risk === 'LOW') this.healthScore = 85;
    else if (this.risk === 'MODERATE') this.healthScore = 60;
    else if (this.risk === 'HIGH') this.healthScore = 35;
    else this.healthScore = 50;

    if (this.age < 30) {
      this.exercise = "Gym workouts, running, or sports activities.";
      this.sleep = "Maintain 7–8 hours of quality sleep.";
    }

    else if (this.age < 50) {
      this.exercise = "Brisk walking, cycling, yoga or light workouts.";
      this.sleep = "Maintain a consistent sleep schedule.";
    }

    else {
      this.exercise = "Light walking, stretching exercises or yoga.";
      this.sleep = "Ensure at least 8 hours of sleep.";
    }

    if (this.risk === 'LOW')
      this.diet = "Balanced diet with fruits, vegetables and protein.";

    else if (this.risk === 'MODERATE')
      this.diet = "Reduce sugar and processed food.";

    else if (this.risk === 'HIGH')
      this.diet = "Strict low sugar and low salt diet.";

    if (this.risk === 'LOW')
      this.tests = "Annual health checkup.";

    else if (this.risk === 'MODERATE')
      this.tests = "Blood pressure and sugar tests.";

    else if (this.risk === 'HIGH')
      this.tests = "Full body health screening.";

  }

  animateHealthScore() {

    let current = 0;

    const interval = setInterval(() => {

      if (current >= this.healthScore) {
        clearInterval(interval);
      } else {
        current++;
        this.animatedScore = current;
      }

    }, 20);

  }

  startNetworkAnimation() {

    const canvas = document.getElementById('aiNetwork') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: NodePoint[] = [];

    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
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
        ctx.fillStyle = "#22c55e";
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
            ctx.strokeStyle = "rgba(34,197,94,0.15)";
            ctx.stroke();

          }
        }
      }

      requestAnimationFrame(animate);

    };

    animate();

  }

}