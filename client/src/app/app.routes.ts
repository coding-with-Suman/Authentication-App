import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { UsersComponent } from './pages/users/users.component';
import { roleGuard } from './guards/role.guard';
import { RoleComponent } from './pages/role/role.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';

export const routes: Routes = [
    {
        path: '',
        component : HomeComponent
    },
    {
        path: 'login',
        component : LoginComponent
    },
    {
        path : 'register',
        component : RegisterComponent
    },
    {
        path : 'profile/:id',
        component : ProfileComponent,
        canActivate : [authGuard]
    },
    {
        path : 'users',
        component : UsersComponent,
        canActivate : [roleGuard],
        data : {
            roles : ['admin']
        }
    },
    {
        path : 'roles',
        component : RoleComponent,
        canActivate : [roleGuard],
        data : {
            roles : ['admin']
        }
    },
    {
        path : 'forgot-password',
        component : ForgotPasswordComponent
    },
    {
        path : 'reset-password',
        component : ResetPasswordComponent
    },
    {
        path : 'change-password',
        component : ChangePasswordComponent,
        canActivate : [authGuard]
    }
];
