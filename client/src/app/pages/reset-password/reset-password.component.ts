import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ResetPasswordRequest } from '../../interfaces/reset-password-request';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthResponse } from '../../interfaces/auth-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
  

  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  matSnackBar = inject(MatSnackBar);
  
  resetPasswordReq  = {} as ResetPasswordRequest;  



  resetPassword(){
      this.authService.resetPassword(this.resetPasswordReq).subscribe({
        next: (response : AuthResponse) => {
          this.matSnackBar.open(response.message, "Close", {
            duration : 3000
          })

          this.router.navigate(['/login']);
          
        },
        error: (error : HttpErrorResponse) => {
          this.matSnackBar.open(error.message, "Close", {
            duration : 3000
          })
        },
      });
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.resetPasswordReq.email = params["email"];
      this.resetPasswordReq.token = params["token"];
    });
  }

}
