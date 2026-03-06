# Issues para Implementación - Autenticación y Control de Roles

## ISSUE #1: Crear modelos y esquemas de BD

**Descripcion**: Define la estructura de tablas para autenticacion

**Tarea**:
- Crear tabla `usuarios`: id, email, password_hash, nombre, role_id, estado, timestamps
- Crear tabla `roles`: id, nombre (ADMIN, EMPLEADO, CLIENTE)
- Crear tabla `permisos`: id, nombre, descripcion, modulo
- Crear tabla `role_permisos`: relacion many-to-many
- Crear tabla `token_blacklist`: token_hash, exp_time (para logout)

**Consideraciones**:
- Email debe tener UNIQUE constraint
- Password_hash: bcrypt (mín 60 caracteres)
- Roles iniciales deben ser seed en DB

**Aceptación**:
- Schema definido sin errores
- Relaciones validadas
- Seeds ejecutados

---

## ISSUE #2: Implementar controlador de autenticación

**Descripción**: Crear endpoints de login, register, logout, refresh

**Tarea**:
- Controlador `authController.js`:
  - `register(req, res)`: email, password, nombre → crear usuario
  - `login(req, res)`: email, password → generar tokens
  - `logout(req, res)`: revocar token
  - `refreshToken(req, res)`: renovar accessToken

**Endpoints**:
```
POST /auth/register
Body: {email, password, nombre}
Response: 201 {id, email, nombre}

POST /auth/login
Body: {email, password}
Response: 200 {accessToken, refreshToken}

POST /auth/logout
Header: Authorization: Bearer <token>
Response: 200 {message: "Logout successful"}

POST /auth/refresh
Cookie: refreshToken
Response: 200 {accessToken}
```

**Validaciones**:
- Email formato válido
- Password min 8 chars (mayús + minús + número)
- Email único
- Credenciales correctas

**Aceptación**:
- Endpoints funcionan sin errores
- Tokens generados correctamente
- Validaciones activas

---

## ISSUE #3: Crear middlewares de seguridad

**Descripción**: Middlewares verifyToken y authorize

**Tarea**:
- Middleware `verifyToken()`: authentication
  - Extrae token de header
  - Valida firma
  - Revisa blacklist
  - Valida expiración
  - Llena req.user

- Middleware `authorize(rolesRequeridos[])`: authorization
  - Verifica req.user.role
  - Valida permisos
  - Retorna 403 si no autorizado

- Middleware `rateLimitLogin()`: rate limiting
  - Máximo 5 intentos por IP en 5 minutos
  - Retorna 429 Too Many Requests

**Ubicacion**: `src/middlewares/`

**Aceptacion**:
- Middlewares funcionan en todas las rutas
- Mensajes de error claros
- Rate limiting activo en login

---

## ISSUE #4: Integración de autenticación en rutas existentes

**Descripción**: Aplicar protección a rutas según roles

**Rutas a proteger**:
```
GET /citas              → verifyToken, authorize(['ADMIN', 'EMPLEADO'])
GET /citas/:id          → verifyToken, authorize(['ADMIN', 'EMPLEADO'], checkOwnershipCliente)
POST /citas             → verifyToken, authorize(['CLIENTE', 'EMPLEADO'])
PUT /citas/:id          → verifyToken, authorize(['ADMIN', 'EMPLEADO'], checkOwnershipEmpleado)
DELETE /citas/:id       → verifyToken, authorize(['ADMIN', 'EMPLEADO'], checkOwnershipEmpleado)

GET /clientes           → verifyToken, authorize(['ADMIN'])
POST /clientes          → verifyToken, authorize(['ADMIN'])
```

**Tarea**:
- Aplicar middlewares a rutas en `src/routes/index.js`
- Crear helper para checkOwnership (cita del usuario actual)
- Rutas públicas: /auth/register, /auth/login
- Validar que controladores usan req.user.id correctamente

**Aceptación**:
- Rutas responden 401/403 antes de ejecutar controlador
- Usuario no autenticado no accede a datos
- Usuario autenticado solo accede a sus datos

---

## ISSUE #5: Implementar almacenamiento seguro de tokens

**Descripción**: Gestión de tokens en lado cliente (frontend)

**Tarea**:
- Actualizar `public/js/app.js`:
  - Almacenar accessToken en localStorage (después de login)
  - Almacenar refreshToken en cookie httpOnly (desde servidor)
  - Incluir accessToken en header Authorization de todos los requests

- Implementar refresh automático:
  - Si 401 → llamar a /auth/refresh
  - Reintentar request original con nuevo token
  - Si refresh falla → redirigir a login

- Limpiar tokens en logout:
  - Eliminar localStorage
  - Cookie se borra automáticamente

**Archivos a modificar**:
- `public/js/app.js` (fetch interceptor)

**Aceptación**:
- Tokens se almacenan tras login
- Requests incluyen Authorization header
- Refresh automático funciona
- Logout limpia todo

---

## ISSUE #6: Tests de autenticación

**Descripción**: Suite de tests para seguridad

**Tarea**:
- Test file: `tests/auth.test.js`
  - Register válido → 201
  - Register email duplicado → 409
  - Register password débil → 400
  - Login válido → 200 + tokens
  - Login contraseña incorrecta → 401
  - Acceso sin token → 401
  - Token expirado → 401
  - Token inválido → 401
  - Rol incorrecto → 403
  - Refresh token válido → 200 + nuevo token
  - Logout invalida token

**Cobertura mínima**: 80% de funciones de auth

**Aceptación**:
- Todos los tests pasan
- Cobertura ≥ 80%
- Casos edge cubiertos

---

## ISSUE #7: Documentación de API - Autenticación

**Descripción**: Documentar endpoints de auth para consumo frontend

**Archivo**: `docs/api_autenticacion.md`

**Contenido**:
```
# API de Autenticación

## POST /auth/register
```

**Tarea**:
- Documentar 4 endpoints de auth con:
  - Request/Response examples
  - Status codes posibles
  - Headers requeridos
  - Validaciones
  - Errores esperados

**Aceptacion**:
- Documento claro para frontend developers
- Ejemplos funcionales
- Errores documentados

---

## ISSUE #8: Variables de entorno y secretos

**Descripción**: Configurar variables para secrets de JWT

**Tarea**:
- Crear/actualizar `.env` (gitignored):
  ```
  JWT_SECRET=<64-char-random>
  JWT_REFRESH_SECRET=<64-char-random>
  JWT_EXPIRATION=15m
  JWT_REFRESH_EXPIRATION=7d
  BCRYPT_ROUNDS=10
  
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```

- Crear `.env.example`:
  ```
  JWT_SECRET=your_secret_here
  JWT_REFRESH_SECRET=your_secret_here
  ...
  ```

- Validar que `server.js` carga .env con dotenv

**Aceptación**:
- Variables cargadas desde .env
- Servidor funciona sin hardcoded secrets
- .env está en .gitignore

---

## ISSUE #9: Configurar Redis para blacklist de tokens

**Descripción**: Infraestructura para validar logout inmediato

**Tarea**:
- Instalar dependencia: `redis` en package.json
- Crear conexión en `src/config/redis.js`
- Implementar funciones:
  - `addToBlacklist(token, expirationTime)`
  - `isTokenBlacklisted(token)`

- En logout:
  - Decodificar JWT sin validar firma (para obtener exp)
  - Agregar a Redis con TTL = exp - now
  - Retornar 200

- En login/every request verification:
  - Antes de validar JWT, checkear Redis
  - Si existe en blacklist → rechazar con 401

**Aceptación**:
- Redis almacena tokens
- Logout invalida inmediatamente
- Requests con token blacklist rechazados

---

## ISSUE #10: Pruebas de seguridad manuales

**Descripción**: Validar que no hay brechas conocidas

**Checklist**:
- Intenta modificar JWT payload en cliente → Es rechazado?
- Intenta acceder a ruta sin token → Es 401?
- Intenta acceder con rol incorrecto → Es 403?
- Intenta password sin mayúsculas → Es validado?
- Logout → Token anterior no funciona
- Password no visible en response
- Refresh token en cookie (no localStorage)
- HTTPS en producción

**Documentación**: `docs/pruebas_seguridad.md`

**Aceptación**:
- Todas las pruebas pasan
- Documento con resultados

---

## ISSUE #11: Crear fixture de datos para desarrollo

**Descripción**: Seeds de usuarios de prueba por rol

**Tarea**:
- Script `seeds/auth.seed.js`:
  ```javascript
  Usuario: admin@test.com / password123A (ADMIN)
  Usuario: empleado@test.com / password456E (EMPLEADO)
  Usuario: cliente@test.com / password789C (CLIENTE)
  ```

- Ejecutar en `npm run db:seed`
- Agregar los credentials en documentación

**Aceptación**:
- Seed crea usuarios sin errores
- Usuarios se pueden loguear
- Credenciales documentadas para testing

---

## Prioridad de implementación

1. **Crítica** (bloquea toda funcionalidad):
   - ISSUE #1: Modelos
   - ISSUE #2: Controller auth
   - ISSUE #3: Middlewares

2. **Alta** (necesaria para completar):
   - ISSUE #4: Proteger rutas
   - ISSUE #5: Almacenamiento tokens

3. **Media** (calidad):
   - ISSUE #6: Tests
   - ISSUE #7: Documentación

4. **Mejora** (operacional):
   - ISSUE #8: Variables env
   - ISSUE #9: Redis
   - ISSUE #10: Tests seguridad
   - ISSUE #11: Fixtures
