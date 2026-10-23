# 🔐 Flujo de Autenticación del Sistema de Farmacia

> Documento de exposición técnica — Módulo de Autenticación

---

## 1. Resumen Ejecutivo

El sistema utiliza un **login en dos pasos (2FA por correo electrónico)**:

1. **Paso 1 — Credenciales:** El usuario envía email + contraseña. El backend valida y envía un código OTP de 6 dígitos al correo.
2. **Paso 2 — OTP:** El usuario ingresa el código recibido. Si es correcto, el backend entrega un **JWT** válido por 30 días.

---

## 2. Arquitectura General

```
┌──────────────────────────┐         ┌──────────────────────────┐
│      FRONTEND (React)     │         │     BACKEND (Express)     │
│                          │  REST   │                          │
│  Login.tsx ──────────────┼────────►│  POST /Auth/login         │
│  VerificarCodigo.tsx ────┼────────►│  POST /Auth/verificar-codigo│
│                          │         │  POST /Auth/reenviar-codigo│
│  Axios interceptor       │         │  GET  /Auth/GetMe         │
│  (Bearer token)          │         │  PUT  /Auth/reset-passwd  │
└──────────────────────────┘         └────────────┬─────────────┘
                                                  │
                                                  ▼
                                          ┌───────────────┐
                                          │   MariaDB     │
                                          │  (tabla       │
                                          │   usuario)    │
                                          └───────────────┘
```

---

## 3. Endpoints de la API (Backend)

| Ruta | Método | Protegida | Descripción |
|------|--------|-----------|-------------|
| `/api/Auth/login` | POST | No (rate limit) | Valida credenciales y envía OTP |
| `/api/Auth/verificar-codigo` | POST | No (rate limit OTP) | Valida OTP y entrega JWT |
| `/api/Auth/reenviar-codigo` | POST | No (rate limit OTP) | Genera y reenvía OTP |
| `/api/Auth/reset-passwd/:idUsuario` | PUT | ✅ authenticate | Cambia contraseña (requiere contraseña actual) |
| `/api/Auth/GetUsers` | GET | ✅ authenticate | Devuelve datos del usuario del token |
| `/api/Auth/GetMe` | GET | ✅ authenticate | Devuelve datos completos del usuario logueado |

---

## 4. Paso 1 — Login (Credenciales)

### 4.1 Secuencia

```
Usuario ingresa email + passwd
        │
        ▼
POST /api/Auth/login
        │
        ├──► GetEmail(email) ──► ¿Existe? ──► No ──► Error 400
        │
        ├──► GetPasswd(email) ──► Obtener hash guardado
        │
        ├──► CheckPassword(passwd, hash) ──► bcrypt.compare
        │         │
        │         └──► No coincide ──► Error 401
        │
        ├──► Generar código OTP (6 dígitos, crypto.randomInt)
        │
        ├──► GuardarCodigo(codigo, email)
        │       └──► UPDATE usuario SET codigoVerificacion, codigoExpiracion (NOW + 5 min), codigoIntentos = 0
        │
        ├──► ObtenerCodigo(email) ──► nombre + apellido (para el email)
        │
        ├──► EnviarCodigoLogin(email, nombre, codigo)
        │       └──► Envío por SMTP (nodemailer) con reintentos
        │
        └──► Respuesta: { requiresCode: true, email }
```

### 4.2 Validaciones de entrada (express-validator)

- `email`: debe ser un email válido
- `passwd`: obligatorio (no vacío)

### 4.3 Rate Limiting

Se aplica `limiter` para prevenir fuerza bruta en el login.

---

## 5. Paso 2 — Verificación del Código OTP

### 5.1 Secuencia

```
Usuario ingresa código de 6 dígitos
        │
        ▼
POST /api/Auth/verificar-codigo
        │
        ├──► ObtenerCodigo(email)
        │       └──► codigoVerificacion, codigoIntentos, codigoVigente, nombre, apellido, estado, confirmed, idUsuario
        │
        ├──► ¿Usuario existe? ──► No ──► Error 400
        ├──► ¿Hay código activo? ──► No ──► Error 400
        ├──► ¿Intentos < 3? ──► No ──► Limpiar código ──► Error 400
        ├──► ¿Código vigente (no expirado)? ──► No ──► Limpiar código ──► Error 400
        ├──► ¿Código coincide? ──► No ──► IncrementarIntentos ──► Error 401 (intentos restantes)
        │
        └──► ✅ Código correcto:
                ├──► LimpiarCodigo(email)  (borra código/expiración/intentos)
                ├──► SetConfirmed(email, 1)  (marca cuenta verificada)
                ├──► GenerateJwt(idUsuario)  (JWT, expira en 30 días)
                ├──► GetIdRol(email)  (obtiene nameRol)
                └──► Respuesta: { token2, IDRol }
```

### 5.2 Reglas del código OTP

| Parámetro | Valor |
|-----------|-------|
| Longitud | 6 dígitos |
| Rango | 100000 — 999999 |
| Vigencia | 5 minutos |
| Máximo de intentos | 3 |
| Comparación de expiración | Con `NOW()` de MariaDB (evita problemas de zona horaria) |

### 5.3 Rate Limiting

Se aplica `limiterOtp` para prevenir fuerza bruta en la verificación.

---

## 6. Reenvío de Código

```
Usuario solicita reenvío
        │
        ▼
POST /api/Auth/reenviar-codigo
        │
        ├──► GetEmail(email) ──► ¿Existe? ──► No ──► Error 400
        │
        ├──► Generar nuevo código OTP
        ├──► GuardarCodigo(codigo, email)  (reinicia expiración e intentos)
        ├──► ObtenerCodigo(email)  (nombre para el email)
        ├──► EnviarCodigoLogin(email, nombre, codigo)
        │
        └──► Respuesta: { ok: true, email }
```

---

## 7. Reset de Contraseña

```
Usuario autenticado solicita cambio de contraseña
        │
        ▼
PUT /api/Auth/reset-passwd/:idUsuario  (requiere token JWT)
        │
        ├──► authenticate middleware ──► Verifica token y consulta usuario en BD
        │
        ├──► Validar adminPasswd (contraseña actual)
        │       └──► GetPasswdById(idUsuario) ──► CheckPassword(adminPasswd, hash)
        │             └──► No coincide ──► Error 401
        │
        ├──► HashPassword(passwd)  (bcrypt, salt 10)
        │
        ├──► ResetPasswd(hash, idUsuario)  (UPDATE usuario SET passwd = ?)
        │
        └──► Respuesta: "Passwd Actualizado"
```

---

## 8. Obtener Datos del Usuario Logueado (`GetMe`)

```
GET /api/Auth/GetMe  (requiere token JWT)
        │
        ├──► authenticate middleware
        │       └──► jwt.verify(token, JWT_SECRET) ──► { id }
        │             └──► Consulta BD: SELECT idUsuario, idTipoUs, nameRol FROM usuario JOIN tipous
        │
        ├──► UserAllModelsId(idUsuario)
        │       └──► SELECT completo (nombre, apellido, img, telefono, email, estado, confirmed,
        │            sucursal, tipous.nameRol)
        │
        └──► Respuesta: objeto con todos los datos del usuario
```

---

## 9. Frontend — Flujo de Login

### 9.1 Login.tsx (`/`)

```
Formulario (email + passwd) con react-hook-form
        │
        ▼
useMutation → Login(formData)
        │
        ├──► POST /Auth/login
        │
        ├──► Si requiresCode:
        │       └──► navigate("/VerificarCodigo", { state: { email } })
        │
        └──► Si token2 (caso legacy, no ocurre en flujo actual):
                └──► Guarda token → redirige por rol
```

**Auto-redirección si ya hay token:**
- Si `localStorage.AUTH_TOKEN` existe → consulta `GetAuthUsers` → redirige por rol.

### 9.2 VerificarCodigo.tsx (`/VerificarCodigo`)

```
Input de 6 dígitos (auto-focus, soporte paste)
        │
        ├──► Contador de vigencia: 5 min (300s)
        ├──► Contador de reenvío: 60s (cooldown)
        │
        ▼
useMutation → VerificarCodigo({ email, codigo })
        │
        ├──► POST /Auth/verificar-codigo
        │
        ├──► Si token2:
        │       ├──► localStorage.setItem('AUTH_TOKEN', token2)
        │       └──► Redirige por rol (IDRol)
        │
        └──► Si error:
                └──► Toast de error + limpiar inputs + focus al primer campo
```

**Botón "Reenviar código":**
- Deshabilitado durante cooldown (60s)
- Al hacer clic → `ReenviarCodigo(email)` → reinicia contadores

### 9.3 Axios Interceptor

```typescript
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use(config => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### 9.4 UseAuth Hook

```typescript
export const useAuth = () => {
    const { data: user, isError, isLoading } = useQuery({
        queryKey: ['usuarioActual'],
        queryFn: GetMeApi,        // Llama a /Auth/GetMe
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 min
    });
    return { user, isError, isLoading };
};
```

---

## 10. Persistencia (Tabla `usuario` en MariaDB)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idUsuario` | INT (PK) | Identificador único |
| `ci` | VARCHAR | Carnet de identidad |
| `nombre` | VARCHAR | Nombre |
| `apellido` | VARCHAR | Apellido |
| `passwd` | VARCHAR | Hash bcrypt de la contraseña |
| `telefono` | VARCHAR | Teléfono |
| `email` | VARCHAR | Correo electrónico |
| `img` | VARCHAR | Ruta de imagen de perfil |
| `estado` | TINYINT | Soft delete (0=inactivo, 1=activo) |
| `confirmed` | TINYINT | Cuenta verificada (0/1) |
| `idTipoUs` | INT (FK) | Tipo de usuario → `tipous` |
| `idSucursal` | INT (FK) | Sucursal → `sucursal` |
| `codigoVerificacion` | VARCHAR | Código OTP actual |
| `codigoExpiracion` | DATETIME | Fecha/hora de expiración del OTP |
| `codigoIntentos` | INT | Intentos fallidos del OTP |

---

## 11. Medidas de Seguridad

| Medida | Implementación |
|--------|----------------|
| **Rate limiting** | `limiter` (login) y `limiterOtp` (OTP) para prevenir fuerza bruta |
| **Validación de inputs** | `express-validator` (email válido, passwd obligatorio, código 6 dígitos numérico) |
| **Hash de contraseña** | bcrypt con salt 10 (`HashPassword` / `CheckPassword`) |
| **OTP de un solo uso** | Se limpia al verificar, expirar o agotar intentos |
| **Expiración OTP** | 5 min, comparación con `NOW()` de MariaDB (evita problemas de zona horaria) |
| **Máximo de intentos** | 3 intentos fallidos → invalida el código |
| **JWT** | Firmado con `JWT_SECRET`, expira en 30 días (`expiresIn: '30d'`) |
| **Autenticación por token** | Middleware `authenticate` verifica el token y consulta la BD en cada request |
| **Confirmación de cuenta** | `confirmed` se marca en 1 al verificar el primer OTP |
| **Reset de contraseña seguro** | Requiere contraseña actual (`adminPasswd`) para autorizar el cambio |

---

## 12. Observaciones y Posibles Mejoras

1. **Token en localStorage**: susceptible a ataques XSS. Considerar migrar a `httpOnly` cookies.
2. **JWT solo contiene `{ id }`**: el middleware hace una query a la BD en cada request para obtener rol/sucursal. Funciona pero añade latencia.
3. **No hay refresh token**: el JWT dura 30 días sin renovación. Si expira, el usuario debe volver a loguearse completo (incluyendo OTP).
4. **Roles con rutas no existentes**: el frontend redirige a `/Farmaceutico`, `/Asesor`, `/Bodeguero` pero el `router.tsx` solo define `/Dashboard` y vistas admin. Esas rutas caerán en `NoFound`.
5. **`GetAuthRol`** está definido en `Api/Auth.ts` pero el endpoint `/Auth/GetRols/:id` no existe en el backend (código muerto).
6. **El flujo de registro** (`EnviarCodigoRegistro`) existe en el mailer pero no se ve usado en los controladores actuales — puede ser código legacy o en desarrollo.
7. **`Login.tsx` consulta `GetAuthUsers`** cuando hay token guardado: este endpoint devuelve `req.user` (solo idUsuario, idTipoUs, nameRol), lo que puede no ser suficiente para la redirección por nombre de rol.

---

## 13. Archivos Clave

### Backend
- `backend/src/Routes/AuthRoutes.ts` — Definición de rutas
- `backend/src/Controllers/AuthControllers.ts` — Lógica de negocio
- `backend/src/Models/UserModels.ts` — Acceso a datos de usuario
- `backend/src/Models/CodigoModels.ts` — Gestión del código OTP
- `backend/src/Middleware/auth.ts` — Middleware de autenticación JWT
- `backend/src/Middleware/validation.ts` — Validación de inputs
- `backend/src/Utils/jwt.ts` — Generación de JWT
- `backend/src/Utils/auth.ts` — Hash y verificación de contraseñas (bcrypt)
- `backend/src/config/mailer.ts` — Envío de correos (nodemailer)
- `backend/src/config/limits.ts` — Rate limiting

### Frontend
- `front/src/view/Login.tsx` — Pantalla de login
- `front/src/view/VerificarCodigo.tsx` — Pantalla de verificación OTP
- `front/src/Api/Auth.ts` — Llamadas a la API de auth
- `front/src/lib/Axios.ts` — Cliente HTTP con interceptor de token
- `front/src/Hook/UseAuth.ts` — Hook para obtener usuario actual
- `front/src/types/index.ts` — Tipos TypeScript

---

*Documento generado a partir del análisis del código fuente del proyecto farmaciaProyecto.*