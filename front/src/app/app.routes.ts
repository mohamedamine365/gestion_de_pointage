import { Routes } from '@angular/router';
import { RepartionDesAccesComponent } from './repartion-des-acces/repartion-des-acces.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ConsultationDesAceesComponent } from './consultation-des-acees/consultation-des-acees.component';
import { ParametrageDesAccesComponent } from './parametrage-des-acces/parametrage-des-acces.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { authGuard } from './services/auth.guard';
import {UserDetailsComponent} from './user-details/user-details.component';

export const routes: Routes = [
    { path: "", redirectTo: "Consultation-des-acces", pathMatch: "full" },
    {
        path: "Consultation-des-acces",
        canActivate: [authGuard],
        component: ConsultationDesAceesComponent
    },
    {
        path: "parametrage-des-acces",
        canActivate: [authGuard],
        component: ParametrageDesAccesComponent
    },    
    {
        path: 'user/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./user-details/user-details.component').then(m => m.UserDetailsComponent)
      },
      {
        path: 'mouvement/details/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./mouvement-details/mouvement-details.component').then(m => m.MouvementDetailsComponent)
      },
      {
        path: 'user-email/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./email-user/email-user.component').then(m => m.EmailUserComponent)
      },
    { path: "repartition-des-acces", canActivate: [authGuard], component: RepartionDesAccesComponent },
    { path: "register", component: RegisterComponent },
    { path: "login", component: LoginComponent },
    { path: "**", component: NotFoundComponent },

];