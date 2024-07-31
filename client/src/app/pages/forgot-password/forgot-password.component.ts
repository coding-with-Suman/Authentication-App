import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthResponse } from '../../interfaces/auth-response';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule, MatIcon],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

    email! : string;
    showEmailSent : boolean = false;
    isSubmitting : boolean = false;

    authServicee = inject(AuthService);
    matSnackBar = inject(MatSnackBar);

    forgotPassword (){
      this.isSubmitting = true;
      this.authServicee.forgotPassword(this.email).subscribe({
        next: (response : AuthResponse) => {
          if(response.isSuccess){
            this.matSnackBar.open(response.message, "Close", {
              duration : 3000
            })
            this.showEmailSent = true;
          }else{
            this.matSnackBar.open(response.message, "Close", {
              duration : 3000
            })
            this.showEmailSent = false;
          }
          
        },
        error: (error : HttpErrorResponse) => {
          this.matSnackBar.open(error.message, "Close", {
            duration : 3000
          })
        },
        complete : () => {
          this.isSubmitting = false;
        }

      });
    }


}
