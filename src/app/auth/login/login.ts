import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // Handle Google redirect result
  async ngOnInit() {
    try {

      const result = await this.auth.handleRedirectResult();

      if (result?.user) {
        this.router.navigate(['/landing']);
      }

    } catch (err: any) {

      this.errorMessage = err.message || 'Google login failed';

    }
  }

  // LOGIN FUNCTION
  async login() {

    try {

      this.loading = true;
      this.errorMessage = '';

      await this.auth.loginWithEmail(this.email, this.password);

      // success
      this.router.navigate(['/landing']);

    } catch (err: any) {

      // Better Firebase error handling
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        this.errorMessage = 'Account not found. Please create an account first.';
      }
      else if (err.code === 'auth/wrong-password') {
        this.errorMessage = 'Incorrect password.';
      }
      else if (err.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email address.';
      }
      else {
        this.errorMessage = err.message || 'Login failed';
      }

    } finally {

      this.loading = false;

    }
  }

  // Navigate to register page
  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Google login
  async googleLogin() {

    try {

      this.loading = true;
      this.errorMessage = '';

      await this.auth.loginWithGoogle();

    } catch (err: any) {

      this.errorMessage = err.message || 'Google login failed';
      this.loading = false;

    }
  }

  // ECG Animation
  ngAfterViewInit() {

    const canvas = document.getElementById('ecgCanvas') as HTMLCanvasElement;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let x = 0;

    const drawECG = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;

      const y = canvas.height / 2;

      ctx.moveTo(0, y);

      for (let i = 0; i < canvas.width; i += 20) {

        const spike =
          Math.sin((i + x) * 0.05) * 10 +
          (Math.random() > 0.98 ? -60 : 0);

        ctx.lineTo(i, y + spike);

      }

      ctx.stroke();

      x += 4;

      requestAnimationFrame(drawECG);

    };

    drawECG();

  }

}