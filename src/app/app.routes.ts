import { Routes } from '@angular/router';
import { AuthGuard } from '../services/AuthGuard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },


    // {
    //   path: 'user-detail',
    //   loadComponent: () => import('./admin/user-login/user-login.component').then(m => m.UserLoginComponent),    canActivate: [AuthGuard],
    // },
    
    {
        path: 'user',
        loadComponent: () => import('./admin/user/user.component').then(m => m.UserComponent), canActivate: [AuthGuard],
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    },
    {
         path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard],
    }

  

];



