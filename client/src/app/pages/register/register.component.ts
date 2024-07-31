import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'
import { Router, RouterLink } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { Observable } from 'rxjs';
import { Role } from '../../interfaces/role';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ValidationError } from '../../interfaces/validation-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule, MatIconModule, MatSelectModule, RouterLink, ReactiveFormsModule, AsyncPipe, CommonModule, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  
  fb = inject(FormBuilder);
  registerForm! : FormGroup;
  router = inject(Router);
  roleService = inject(RoleService);
  roles$! : Observable<Role[]> ; 
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);

  hide : boolean = true;
  hide1 : boolean = true;

  errors! : ValidationError[];


  registration(){
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.matSnackBar.open(response.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
        });
        this.router.navigate(['/login']);
      },
      error: (error : HttpErrorResponse) => {
        if(error!.status === 400){
          this.errors = error!.error;
          this.matSnackBar.open(error.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        }
        
      },
      complete : () => console.log("Register Successfully")
    });

  }

  private passwordValidator(control : AbstractControl) : {[key : string] : boolean} | null{
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if(password && confirmPassword && password !== confirmPassword){
      return { passwordMismatch : true };
    }

    return null;
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      fullName : ['', [Validators.required]],
      password : ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword : ['', [Validators.required, Validators.minLength(8)]],
      role : ['', [Validators.required]]
    },
    {
      validators : [this.passwordValidator]
    }
  
    );
    this.roles$ = this.roleService.getRoles();
  }

}
