import { Component, inject } from '@angular/core';
import { RoleFormComponent } from '../../components/role-form/role-form.component';
import { RoleService } from '../../services/role.service';
import { RoleCreateRequest } from '../../interfaces/role-create-request';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleListComponent } from '../../components/role-list/role-list.component';
import { AsyncPipe } from '@angular/common';
import { Role } from '../../interfaces/role';
import { RoleResponse } from '../../interfaces/role-response';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [RoleFormComponent, MatSnackBarModule, RoleListComponent, AsyncPipe, MatFormField, MatInputModule, MatSelectModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent {
  roleService = inject(RoleService);
  authService = inject(AuthService);
  errorMessage!: string;
  role: RoleCreateRequest = {} as RoleCreateRequest;
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);
  roles$ = this.roleService.getRoles();
  selectedUser : string = "" ;
  selectedRole : string = "";
  users$ = this.authService.getUsers();


  createRole(role: RoleCreateRequest) {
    this.roleService.createRole(role).subscribe({
      next: (response : RoleResponse) => {
        this.roles$ = this.roleService.getRoles();
        this.matSnackBar.open(response.message, 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
        });

      },
      error: (error: HttpErrorResponse) => {
        if (error!.status === 400) {
          this.matSnackBar.open(error.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        }

      },
      complete: () => console.log("Role Created Successfully")
    });
  }

  deleteRole(id : string){
    this.roleService.deleteRole(id).subscribe({
      next: (response : RoleResponse) => {
        this.roles$ = this.roleService.getRoles();
        this.matSnackBar.open(response.message, 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
        });

      },
      error: (error: HttpErrorResponse) => {
        if (error!.status === 400) {
          this.matSnackBar.open(error.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        }

      },
      complete: () => console.log("Role Deleted Successfully")
    });
  }

  assignRole() {
    this.roleService.assignRole(this.selectedUser, this.selectedRole).subscribe({
      next: (response : RoleResponse) => {
        this.roles$ = this.roleService.getRoles();
        this.matSnackBar.open(response.message, 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
        });

      },
      error: (error: HttpErrorResponse) => {
        if (error!.status === 400) {
          this.matSnackBar.open(error.error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        }

      },
      complete: () => console.log("Role Assign Successfully")
    });
  }

  onSelectionUser(event : MatSelectChange){
    this.selectedUser = event.value;
  }

  onSelectionRole(event : MatSelectChange){
    this.selectedRole = event.value;
  }

  
  

}
