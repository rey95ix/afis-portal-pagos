import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Rutas públicas (solo accesibles si NO está autenticado)
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'solicitar-activacion',
        loadComponent: () => import('./features/auth/solicitar-activacion/solicitar-activacion.component').then(m => m.SolicitarActivacionComponent)
      },
      {
        path: 'activar-cuenta',
        loadComponent: () => import('./features/auth/activar-cuenta/activar-cuenta.component').then(m => m.ActivarCuentaComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: 'portal',
    canActivate: [authGuard],
    loadComponent: () => import('./features/portal/layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/portal/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/portal/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'cambiar-password',
        loadComponent: () => import('./features/portal/cambiar-password/cambiar-password.component').then(m => m.CambiarPasswordComponent)
      },
      {
        path: 'sesiones',
        loadComponent: () => import('./features/portal/sesiones/sesiones.component').then(m => m.SesionesComponent)
      },
      {
        path: 'contratos',
        loadComponent: () => import('./features/portal/contratos/contratos.component').then(m => m.ContratosComponent)
      },
      {
        path: 'contratos/:id',
        loadComponent: () => import('./features/portal/contratos/contrato-detalle/contrato-detalle.component').then(m => m.ContratoDetalleComponent)
      },
      { path: '', redirectTo: 'contratos', pathMatch: 'full' }
    ]
  },

  // Ruta comodín
  { path: '**', redirectTo: 'auth/login' }
];
