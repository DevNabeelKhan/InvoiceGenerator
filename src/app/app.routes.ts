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
    },
    {
        path: 'customers',
        loadComponent: () => import('./admin/customers/customers.component').then(m => m.CustomersComponent), canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries',
        loadComponent: () => import('./admin/beneficiaries/beneficiaries.component').then(m => m.BeneficiariesComponent), canActivate: [AuthGuard],
    },
    {
        path: 'products',
        loadComponent: () => import('./admin/products/products.component').then(m => m.ProductsComponent), canActivate: [AuthGuard],
    }

  

];



