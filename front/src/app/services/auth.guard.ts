import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AthService } from './ath.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AthService);
  const router = inject(Router);
  
  console.log('Token status:', authService.isLoggedIn());
  console.log('Actual token value:', localStorage.getItem('token'));

  if (!authService.isLoggedIn()) {
    console.log('Attempting redirect to login');
    // Add return and ensure navigation completes
    return router.navigate(['/login'], {
      replaceUrl: true,  // Prevent back button issues
      queryParams: { returnUrl: state.url }
    });
  }
  
  return true;
};