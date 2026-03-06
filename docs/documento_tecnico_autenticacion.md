# Documento Técnico: Diseño de Arquitectura de Autenticación

## 1. Resumen Ejecutivo

Se diseña un sistema de autenticación híbrido basado en **JWT + Sesión de validación** para el sistema de gestión de citas. La arquitectura implementa control de roles (RBAC) con tres niveles de acceso: ADMIN, EMPLEADO y CLIENTE.

**Decisión clave**: JWT en header Authorization + refresh tokens en httpOnly cookies para balancear seguridad y escalabilidad.

---

## 2. Justificación de Arquitectura

### 2.1 ¿Por qué JWT y no sesiones tradicionales?

| Criterio | JWT | Sesión |
|----------|-----|--------|
| Escalabilidad | Stateless, fácil distribuir | Requiere shared storage |
| API-first | Nativo en APIs RESTful | Diseñado para web tradicional |
| Testing | Más fácil (sin estado servidor) | Requiere infraestructura |
| Mobile | Compatible directo | Cookies limitadas |

**Conclusión**: JWT es mejor para nuestra API REST que necesita escalar.

### 2.2 ¿Por qué híbrido (JWT + Sesión)?

- **JWT** = rendimiento, escalabilidad
- **Sesión** = logout inmediato, revocación de tokens

**Implementación**:
- Mantener blacklist de tokens revocados en Redis (temporalmente)
- Al logout: agregar token a blacklist con TTL = expiration time
- Middleware verifica: ¿token en blacklist? → rechazar

Costo: O(1) lookup en Redis vs revocación inmediata.

---

## 3. Modelo de Datos

### 3.1 Tabla de usuarios

```javascript
{
  id: UUID,
  email: string (unique),
  password_hash: string (bcrypt),
  nombre: string,
  role_id: FK(roles),
  estado: ENUM ['activo', 'inactivo'],
  fecha_creacion: timestamp,
  fecha_actualizacion: timestamp
}
```

### 3.2 Tabla de roles

```javascript
{
  id: UUID,
  nombre: ENUM ['ADMIN', 'EMPLEADO', 'CLIENTE'],
  descripcion: string,
  permisos: FK(permisos) array
}
```

### 3.3 Tabla de permisos

```javascript
{
  id: UUID,
  nombre: string (ej: 'crear_cita', 'ver_clientes'),
  descripcion: string,
  modulo: string (ej: 'citas', 'clientes')
}
```

---

## 4. Flujos de Seguridad

### 4.1 Registro de usuario

```
POST /register
Body: {email, password, nombre, rol?}
  ↓
Validaciones:
  1. Email válido y único → 409 si existe
  2. Password min 8 chars + validaciones
     (mayús, minús, número u símbolo)
  3. Encriptar con bcrypt (rounds: 10)
  ↓
Crear usuario con rol por defecto (CLIENTE)
  ↓
Response: 201 Created (no retornar password)
```

### 4.2 Login

```
POST /login
Body: {email, password}
  ↓
Validaciones:
  1. Usuario existe por email
  2. Contraseña coincide (bcrypt.compare)
  ↓
Generar tokens:
  - accessToken: JWT (validity: 15 minutos)
  - refreshToken: JWT (validity: 7 días)
  ↓
Almacenar:
  - accessToken: header Authorization
  - refreshToken: Cookie (httpOnly, Secure, SameSite)
  ↓
Response: 200 OK + tokens
```

### 4.3 Verificación de token

```
Middleware: verifyToken()
  ↓
Leer header: Authorization: Bearer <token>
  ↓
Validar firma con JWT_SECRET
  ↓
Revisar si está en blacklist (Redis)
  ↓
Validar exp claim (expiración)
  ↓
Si expirado → 401, cliente usa refreshToken
Si válido → Extraer payload a req.user
```

### 4.4 Refresh de token

```
POST /refresh
Body: vacío (token en cookie)
  ↓
Verificar refreshToken válido
  ↓
Generar nuevo accessToken
  ↓
Response: 200 + nuevo accessToken
```

---

## 5. Riesgos Mitigados

| Riesgo | Mitigación | Costo |
|--------|-----------|-------|
| SQL Injection en login | Prepared statements + ORM | Bajo |
| Token JWT falso | Firma con secret + algoritmo HMAC-SHA256 | Bajo |
| XSS roba token | refreshToken en httpOnly cookie | Medio (infraestructura) |
| Fuerza bruta en login | Rate limiting (5 intentos/5 min) | Bajo |
| Contraseña débil | Validación en cliente + servidor | Bajo |
| CSRF | SameSite=Strict en cookies | Bajo |
| Token sin expiración | JWT con claim exp (15 min accessToken) | Bajo |
| Escalación de privilegios | Middleware authorization en cada ruta | Bajo |
| Sesión hijacking | Validar IP/User-Agent (opcional) | Medio |

---

## 6. Roles y Permisos Específicos

### 6.1 ADMIN
- **Permisos**: crear_cita, editar_cita, eliminar_cita, ver_todas_citas
- **Permisos**: crear_empleado, editar_empleado, eliminar_empleado
- **Permisos**: crear_cliente, editar_cliente, eliminar_cliente
- **Permisos**: ver_reportes, exportar_datos
- **Rutas accesibles**: 
  - `/dashboard` (admin view)
  - `/clientes` (CRUD)
  - `/empleados` (CRUD)
  - `/citas` (CRUD todas)
  - `/reportes`

### 6.2 EMPLEADO
- **Permisos**: crear_cita, editar_cita, eliminar_cita (solo propias)
- **Permisos**: ver_clientes (solo asignados)
- **Rutas accesibles**:
  - `/dashboard` (empleado view)
  - `/citas/mis-citas`
  - `/citas` (filtrado: solo sus citas como empleado)
  - `/clientes/mis-clientes`

### 6.3 CLIENTE
- **Permisos**: crear_cita (agendar), ver_cita (propias)
- **Permiso**: cancelar_cita (solo propias)
- **Rutas accesibles**:
  - `/citas/mis-citas` (solo sus citas)
  - `/agendar` (crear cita)

---

## 7. Implementación de Autorización

### Estrategia 1: Middleware por ruta

```javascript
// routes/admin.js
router.delete('/empleados/:id', 
  verifyToken,                    // Nivel 1: ¿Quién?
  authorize(['ADMIN']),            // Nivel 2: ¿Qué puede hacer?
  controllerEmpleados.delete       // Nivel 3: Lógica
);
```

### Estrategia 2: Validación dentro del controlador

```javascript
// Cuando hay permisos granulares
function getCitas(req, res) {
  const usuarioId = req.user.id;
  const rol = req.user.role;
  
  if (rol === 'ADMIN') {
    // Ver todas
  } else if (rol === 'EMPLEADO') {
    // Ver solo mis citas como empleado
  } else {
    // Cliente: ver solo citas agendadas conmigo
  }
}
```

---

## 8. Almacenamiento de Secretos

### Variables de entorno (.env)

```env
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

BCRYPT_ROUNDS=10

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL_BLACKLIST=86400  # 24 horas, solo para logout
```

**Notas**:
- `JWT_SECRET` y `JWT_REFRESH_SECRET` deben ser diferentes
- NO hardcodear en código
- En producción: usar Azure KeyVault / AWS Secrets Manager

---

## 9. Consideraciones de Performance

### 9.1 Verificación de token

- **Tiempo**: O(1) - solo validar firma JWT
- **Sin BD**: El JWT contiene el rol, no hay que buscar en BD

### 9.2 Blacklist de tokens revocados

- **Almacenamiento**: Redis (memoria)
- **TTL**: Se borra automáticamente tras expiración JWT
- **Lookup**: O(1)

### 9.3 Crecimiento

Si hay millones de logout/día:
- Implementar sliding window (renovar token automáticamente)
- Reducir TTL de blacklist a 30 minutos
- Considerar Cassandra si Redis se queda sin memoria

---

## 10. Testing

### Casos de prueba mínimos

```
Login con credenciales válidas → 200 + tokens
Login con credenciales inválidas → 401
Acceso sin token → 401
Acceso con token expirado → 401
Acceso a ruta protegida con rol correcto → 200
Acceso a ruta protegida con rol incorrecto → 403
Refresh token válido → Nuevo accessToken
Refresh token inválido → 401
Logout registra token en blacklist
Token blacklist rechazado
```

---

## 11. Línea de Tiempo de Implementación

**Semana 10**: Implementar:
1. Modelos de BD (usuarios, roles, permisos)
2. Controller de autenticación (login, register, logout, refresh)
3. Middlewares de verificación (verifyToken, authorize)
4. Tests unitarios

**Semana 11**: 
1. Integración con frontend
2. Persistencia de tokens
3. Manejo de refresh automático
4. Tests de integración

**Semana 12**:
1. Seguridad avanzada (rate limiting, IP validation)
2. Auditoría de accesos
3. Documentación API

---

## 12. Referencias de Seguridad

- OWASP Top 10: A01 Broken Access Control
- RFC 7519: JWT specification
- bcrypt: Password hashing best practices
- HTTPS obligatorio en producción
