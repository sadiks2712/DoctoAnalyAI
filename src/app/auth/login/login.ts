import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // ✅ Handle Google redirect result
  async ngOnInit() {
    try {
      const result = await this.auth.handleRedirectResult();
      if (result?.user) {
        this.router.navigate(['/landing']); // ⭐ CORRECT
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Google login failed';
    }
  }

  async login() {
    try {
      this.loading = true;
      this.errorMessage = '';
      await this.auth.loginWithEmail(this.email, this.password);

      // ✅ go to navbar + hero page
      this.router.navigate(['/landing']);

    } catch (err: any) {
      this.errorMessage = err.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  async register() {
    try {
      this.loading = true;
      this.errorMessage = '';
      await this.auth.register(this.email, this.password);

      // ✅ go to navbar + hero page
      this.router.navigate(['/landing']);

    } catch (err: any) {
      this.errorMessage = err.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }

  async googleLogin() {
    try {
      this.loading = true;
      this.errorMessage = '';
      await this.auth.loginWithGoogle();
      // ⚠️ redirect handled by Firebase
    } catch (err: any) {
      this.errorMessage = err.message || 'Google login failed';
      this.loading = false;
    }
  }
  ngAfterViewInit() {
  const canvas = document.getElementById('ecgCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let x = 0;

  function drawECG() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;

    let y = canvas.height / 2;

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
  }

  drawECG();
}
}