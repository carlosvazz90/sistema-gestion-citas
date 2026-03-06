# Arquitectura de Autenticación y Control de Roles

## Investigación - Preguntas Guía

### 1. ¿Qué es autenticación y en qué se diferencia de autorización?

**Autenticación**: Verificar *quién eres*. Proceso de confirmar la identidad del usuario (ej: username + password).

**Autorización**: Verificar *qué puedes hacer*. Proceso de determinar si un usuario autenticado tiene permisos para acceder a un recurso.

**Ejemplo en nuestro sistema**:
- Autenticación: Usuario inicia sesión con email y contraseña
- Autorización: Después de autenticado, verifica si tiene rol de "admin" antes de acceder a `/clientes`

### 2. ¿Qué son JWT, sesiones y OAuth?

**JWT (JSON Web Tokens)**
- Token sin estado (stateless) que contiene la información del usuario
- Estructura: `header.payload.signature`
- Almacenado en cliente (localStorage/cookie)
- No requiere validación en servidor en cada request
- Ventaja: Escalable, ideal para APIs
- Riesgo: Si se compromete, no hay forma de revocarlo inmediatamente

**Sesiones**
- Estado almacenado en el servidor
- Cliente recibe solo session ID en cookie
- Servidor busca datos de sesión en cada request
- Ventaja: Control total, fácil logout
- Riesgo: Requiere memoria en servidor, no escala bien

**OAuth**
- Protocolo para autenticación delegada (LOGIN CON GOOGLE/FACEBOOK)
- Usuario se autentica con proveedor externo
- Aplicación recibe token de acceso sin conocer contraseña
- Ventaja: Seguridad, menos datos personales
- Uso: Login social, integraciones

### 3. ¿Cuándo conviene usar tokens y cuándo sesiones?

**USA TOKENS (JWT) CUANDO**:
- API RESTful que escala horizontalmente
- Mobile apps (no soportan bien cookies)
- Múltiples dominios (CORS)
- Microservicios que no comparten BD

**USA SESIONES CUANDO**:
- Monolítica (servidor único)
- Necesitas logout inmediato
- Control strict sobre tokens

**Para nuestro sistema**:
- Híbrido: JWT en API + Sesión como respaldo
- JWT en header (Authorization: Bearer token)
- Refresh token con mayor duración

### 4. ¿Qué riesgos de seguridad existen en un mal diseño?

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| SQL Injection en login | Acceso a toda la BD | Usar ORM/Prepared statements |
| JWT sin firma | Token falso fácil de crear | Usar secret key fuerte + algoritmo (HS256) |
| Token en localStorage | XSS roba el token | Almacenar en httpOnly cookies |
| Sin expiración | Token válido para siempre | JWT con exp claim (15min acceso) |
| Contraseña en texto plano | Brechas de BD exponibles | Hashear con bcrypt |
| Sin validación de permisos | Escalación de privilegios | Middleware de autorización en cada ruta |
| Contraseña débil | Fuerza bruta fácil | Min 8 caracteres + validación |

### 5. ¿Cómo se definen roles y permisos en sistemas reales?

**Modelo RBAC (Role-Based Access Control)**
```
Usuario -> Rol -> Permisos
```

Ejemplo para nuestro sistema:
- **Admin**: crear/editar/eliminar citas, gérer clientes, ver reportes
- **Empleado**: crear/editar/eliminar sus citas, ver clientes
- **Cliente**: ver/crear/cancelar SOLO sus citas

**Implementación en BD**:
```
users: id, email, password_hash, role_id
roles: id, nombre
permisos: id, nombre, descripcion
role_permiso: role_id, permiso_id
```

## Decisiones de Diseño para el Sistema

### Opción elegida: JWT + Sesión de respaldo

**Por qué JWT**:
- Sistema será API-first
- Facilita testing
- Preparado para escalar

**Por qué sesión de respaldo**:
- Logout inmediato si es necesario
- Control sobre tokens revocados

**Estructura de JWT**:
```json
{
  "sub": "user_id",
  "email": "usuario@example.com",
  "role": "empleado",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Flujo de autenticación**:
1. POST /login (email + password)
2. Validar credenciales, generar JWT + refresh token
3. Cliente almacena access token (15min) y refresh token (7 días)
4. Cada request: header `Authorization: Bearer ACCESS_TOKEN`
5. Si expira: usar refresh token para obtener nuevo access token

### Roles mínimos
- **ADMIN**: Control total
- **EMPLEADO**: Gestión de citas propias
- **CLIENTE**: Visualización y agendamiento de sus citas

### Rutas protegidas
- `/dashboard` → ADMIN, EMPLEADO
- `/clientes` → ADMIN
- `/citas/mis-citas` → CLIENTE, EMPLEADO
- `/citas` (POST) → CLIENTE, EMPLEADO

