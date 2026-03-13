import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  menuOpen = false;
  scrolled = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  toggleMenu(){
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(){
    this.menuOpen = false;
  }

  @HostListener('window:scroll')
  onScroll(){
    this.scrolled = window.scrollY > 50;
  }

  async logout(){
    try{

      await this.auth.logout();

      console.log('User logged out');

      this.closeMenu();

      await this.router.navigate(['/login']);

    }catch(error){
      console.error(error);
    }
  }

}