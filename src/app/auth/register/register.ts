import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit, OnDestroy {

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  // Slider
  currentIndex = 0;
  intervalId: any;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // Images from your project
  images = [
    'assets/image.png',
    'assets/image0.png',
    'assets/image1.png',
  ];

  // Auto slider start
  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Slider next
  nextSlide(): void {
    this.currentIndex =
      (this.currentIndex + 1) % this.images.length;
  }

  // Slider previous
  prevSlide(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  // Reset error on typing
  clearError(): void {
    this.errorMessage = '';
  }

  // Register user
  async register(): Promise<void> {

    // Validation
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = "Please fill all fields";
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = "Password must be at least 6 characters";
      return;
    }

    try {

      this.loading = true;
      this.errorMessage = '';

      await this.auth.register(this.email, this.password);

      // Redirect after registration
      this.router.navigate(['/dashboard']);

    } catch (err: any) {

      this.errorMessage =
        err?.message || 'Registration failed';

    } finally {

      this.loading = false;

    }

  }

}