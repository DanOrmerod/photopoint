import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add authorization header if token exists
  const token = authService.getToken();
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('Auth interceptor: 401 error detected, redirecting to login');
        const currentUrl = router.url;
        if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
          localStorage.setItem('returnUrl', currentUrl);
          console.log('Auth interceptor: Saved return URL:', currentUrl);
        }
        localStorage.removeItem('photopoint_token');
        localStorage.removeItem('photopoint_user');
        console.log('Auth interceptor: Cleared tokens, navigating to /login');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};