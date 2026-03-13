import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const auth = getAuth();

  return new Observable<boolean>((observer) => {

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {

      if (user) {

        observer.next(true);

      } else {

        alert('Please login first');
        router.navigate(['/login']);

        observer.next(false);
      }

      observer.complete();
      unsubscribe();

    });

  });

};