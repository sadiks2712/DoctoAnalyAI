import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  UserCredential
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {}

  // ✅ Google login (redirect — fixes COOP warning)
  loginWithGoogle() {
    return signInWithRedirect(this.auth, new GoogleAuthProvider());
  }

  // ✅ Handle redirect result (call on app start)
  handleRedirectResult(): Promise<UserCredential | null> {
    return getRedirectResult(this.auth);
  }

  // ✅ Email login
  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ Register
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ Logout
  logout() {
    return signOut(this.auth);
  }
  
}