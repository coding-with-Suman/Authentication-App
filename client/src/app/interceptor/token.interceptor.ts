import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(!authService.getToken()) return next(req);
    
  const cloned = req.clone({
    headers : req.headers.set('Authorization', 'Bearer '+authService.getToken()),
  });

  return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          authService.refreshToken({
            email : authService.getUserDetail()?.email || "",
            refreshToken : authService.getRefreshToken() || "",
            token : authService.getToken() || ""
            }).subscribe({
              next: (response: AuthResponse) => {
                if(response.isSuccess){
                  localStorage.setItem("user", JSON.stringify(response));
                  const cloned = req.clone({
                    setHeaders : {
                      Authorization : `Bearar ${response.token}`
                    }
                  })
                }
              },
              error: (error) => {
                authService.logout();
                router.navigate(['/login']);
              }
            })
          
        }
        return throwError(error);
      })
  );

};
