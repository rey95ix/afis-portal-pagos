# Portal de Clientes - afis-pagos

## Descripción

Frontend Angular para el portal de clientes del sistema AFIS. Permite a los clientes autenticarse, gestionar su perfil, cambiar contraseñas y administrar sesiones activas.

**URL de desarrollo:** `http://localhost:4200`
**Backend API:** `http://localhost:4001`

## Tecnologías

- Angular 21 (Standalone Components)
- Bootstrap 5 + Bootstrap Icons
- SweetAlert2 (notificaciones)
- RxJS (programación reactiva)
- Angular Signals (estado reactivo)

## Estructura del Proyecto

```
src/app/
├── core/                           # Servicios singleton, guards, interceptors
│   ├── guards/
│   │   └── auth.guard.ts           # Guards: authGuard, publicGuard
│   ├── interceptors/
│   │   └── auth.interceptor.ts     # Inyección de JWT en headers
│   ├── models/
│   │   ├── auth.model.ts           # Interfaces de auth + ApiResponse
│   │   ├── cliente.model.ts        # Interfaces de cliente
│   │   └── index.ts
│   └── services/
│       ├── auth.service.ts         # Servicio de autenticación
│       ├── token-storage.service.ts # Manejo de tokens (sessionStorage)
│       └── index.ts
│
├── features/                       # Módulos de funcionalidad
│   ├── auth/                       # Páginas públicas de autenticación
│   │   ├── login/
│   │   ├── solicitar-activacion/
│   │   ├── activar-cuenta/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── portal/                     # Páginas protegidas del portal
│       ├── layout/                 # Layout con navbar
│       ├── home/                   # Dashboard
│       ├── perfil/                 # Ver perfil
│       ├── cambiar-password/       # Cambiar contraseña
│       └── sesiones/               # Gestión de sesiones
│
├── environments/
│   ├── environment.ts              # Configuración desarrollo
│   └── environment.prod.ts         # Configuración producción
│
├── app.config.ts                   # Configuración de la aplicación
├── app.routes.ts                   # Configuración de rutas
├── app.ts                          # Componente raíz
└── app.html                        # Template raíz (router-outlet)
```

## Convención de Respuestas del API

**IMPORTANTE:** El backend siempre retorna las respuestas envueltas en un objeto `data`:

```typescript
// Estructura de respuesta del backend
{
  data: {
    // Contenido real de la respuesta
  }
}
```

### Modelo ApiResponse

En `core/models/auth.model.ts` existe el wrapper genérico:

```typescript
export interface ApiResponse<T> {
  data: T;
}
```

### Uso en Servicios

Todos los servicios deben usar `ApiResponse<T>` y extraer los datos con `map()`:

```typescript
// Ejemplo de implementación correcta
getProfile(): Observable<ClienteProfile> {
  return this.http.get<ApiResponse<ClienteProfile>>(`${this.API_URL}/profile`).pipe(
    map(response => response.data)
  );
}

// Para POST con efectos secundarios (ej: guardar tokens)
login(data: LoginRequest): Observable<LoginResponse> {
  return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, data).pipe(
    tap(response => {
      // Usar response.data para acceder a los datos
      this.tokenStorage.saveTokens(response.data.access_token, response.data.refresh_token);
    }),
    map(response => response.data) // Siempre retornar solo data
  );
}
```

### Patrón para Nuevos Endpoints

Al crear nuevos servicios, seguir este patrón:

```typescript
import { ApiResponse } from '../models';

// 1. Definir la interfaz de respuesta
export interface MiRespuesta {
  campo1: string;
  campo2: number;
}

// 2. En el servicio
getMisDatos(): Observable<MiRespuesta> {
  return this.http.get<ApiResponse<MiRespuesta>>(`${this.API_URL}/endpoint`).pipe(
    map(response => response.data)
  );
}
```

## Rutas

### Rutas Públicas (`/auth/*`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/auth/login` | LoginComponent | Inicio de sesión |
| `/auth/solicitar-activacion` | SolicitarActivacionComponent | Solicitar activación con DUI |
| `/auth/activar-cuenta` | ActivarCuentaComponent | Activar cuenta con token |
| `/auth/forgot-password` | ForgotPasswordComponent | Solicitar reset de contraseña |
| `/auth/reset-password` | ResetPasswordComponent | Restablecer contraseña |

### Rutas Protegidas (`/portal/*`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/portal/home` | HomeComponent | Dashboard principal |
| `/portal/perfil` | PerfilComponent | Ver información del cliente |
| `/portal/cambiar-password` | CambiarPasswordComponent | Cambiar contraseña |
| `/portal/sesiones` | SesionesComponent | Ver y revocar sesiones |

## Configuración

### URLs con Hash

El proyecto usa `HashLocationStrategy` para las URLs:
- `http://localhost:4200/#/auth/login`
- `http://localhost:4200/#/portal/home`

Configurado en `app.config.ts`:
```typescript
provideRouter(routes, withHashLocation())
```

### Almacenamiento de Tokens

Los tokens se almacenan en `sessionStorage` (más seguro que localStorage):
- `cliente_access_token` - JWT de acceso
- `cliente_refresh_token` - Token de renovación
- `cliente_data` - Datos del cliente

### Interceptor HTTP

El interceptor (`auth.interceptor.ts`) automáticamente:
1. Agrega el header `Authorization: Bearer <token>` a todas las peticiones protegidas
2. Redirige al login si recibe un 401

Endpoints públicos excluidos del interceptor:
- `/login`
- `/solicitar-activacion`
- `/activar-cuenta`
- `/forgot-password`
- `/reset-password`

## Guards

- **authGuard**: Protege rutas que requieren autenticación. Redirige a `/auth/login` si no hay token.
- **publicGuard**: Protege rutas públicas. Redirige a `/portal/home` si ya está autenticado.

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start           # http://localhost:4200

# Build producción
npm run build

# Tests
npm test
```

## Estilos

### Clases Personalizadas

- `.auth-container` - Contenedor centrado con gradiente para páginas de auth
- `.auth-card` - Card blanco para formularios de auth

### Bootstrap Customizado

Los botones primarios tienen un gradiente personalizado definido en `styles.css`.

## Notas de Desarrollo

### Crear Nuevo Componente

1. Crear en la carpeta correspondiente (`features/auth/` o `features/portal/`)
2. Usar standalone component
3. Agregar la ruta en `app.routes.ts` con lazy loading

```typescript
{
  path: 'nuevo',
  loadComponent: () => import('./features/portal/nuevo/nuevo.component')
    .then(m => m.NuevoComponent)
}
```

### Agregar Nuevo Endpoint

1. Definir interfaces en `core/models/`
2. Agregar método en el servicio correspondiente usando `ApiResponse<T>`
3. Usar `map(response => response.data)` para extraer datos

### Manejo de Errores

Los errores del backend vienen en formato:
```json
{
  "statusCode": 400,
  "message": "Mensaje de error",
  "error": "Bad Request"
}
```

Acceder al mensaje: `error.error?.message`
