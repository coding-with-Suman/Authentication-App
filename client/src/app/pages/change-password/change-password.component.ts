import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthResponse } from '../../interfaces/auth-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  currentPassword! : string;
  newPassword! : string;

  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);

  changePassword = () => {
    this.authService.changePassword({
      email : this.authService.getUserDetail()?.email,
      currentPassword : this.currentPassword,
      newPassword : this.newPassword
    }).subscribe({
      next : (response : AuthResponse) => {
        if(response.isSuccess) {
          this.matSnackBar.open(response.message, "Close", {
            duration : 3000
          });
          this.authService.logout();
          this.router.navigate(["/login"]);
        }else{
          this.matSnackBar.open(response.message, "Close", {
            duration : 3000
          });
        }
      },
      error : (error : HttpErrorResponse) => {
        this.matSnackBar.open(error.error.message, "Close", {
          duration : 3000
        });
      }

    })
  }

}
