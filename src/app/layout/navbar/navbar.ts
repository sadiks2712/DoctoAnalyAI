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

  /* ===== NAVBAR SCROLL EFFECT ===== */

  @HostListener('window:scroll', [])
  onScroll(){

    if(window.scrollY > 50){
      this.scrolled = true;
    }else{
      this.scrolled = false;
    }

  }

  /* ===== LOGOUT ===== */

  async logout(){
    try{

      await this.auth.logout();
      console.log('User logged out successfully');

      await this.router.navigateByUrl('/login',{replaceUrl:true});

    }catch(error){
      console.error('Logout failed:',error);
    }
  }

}