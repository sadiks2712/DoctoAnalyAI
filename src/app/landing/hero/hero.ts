import { Component, AfterViewInit, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class Hero implements AfterViewInit, OnInit {

  totalRecords = 0;
  highRisk = 0;
  regions = 0;
  accuracy = 0;

  // smooth scroll
  scrollToFeatures() {
    document.getElementById('features')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnInit() {
    this.startCounters();
  }

  ngAfterViewInit() {
    this.initReveal();
  }

  /* ⭐ COUNTERS */
  startCounters() {
    this.animateValue('totalRecords', 12500, 1200);
    this.animateValue('highRisk', 3200, 1200);
    this.animateValue('regions', 24, 1200);
    this.animateValue('accuracy', 94, 1200);
  }

  animateValue(
    key: 'totalRecords' | 'highRisk' | 'regions' | 'accuracy',
    end: number,
    duration: number
  ) {
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      (this as any)[key] += increment;

      if ((this as any)[key] >= end) {
        (this as any)[key] = end;
        clearInterval(timer);
      }

      (this as any)[key] = Math.floor((this as any)[key]);
    }, 16);
  }

  /* ⭐ SCROLL REVEAL */
  initReveal() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-up')
      .forEach(el => observer.observe(el));
  }
}