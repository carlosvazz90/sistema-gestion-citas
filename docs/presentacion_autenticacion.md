# Presentación: Arquitectura de Autenticación y Roles

## Decisión estratégica: ¿JWT o Sesiones?

### Análisis de opciones

| | JWT (Tokens) | Sesiones (Server-side) |
|---|---|---|
| **Escalabilidad** | Stateless - fácil distribuir | Requiere almacenamiento compartido |
| **Mobile apps** | Nativo | Limitado |
| **API RESTful** | Estándar actual | Diseñado para web tradicional |
| **Logout instantáneo** | Requiere blacklist | Automático |
| **Storage servidor** | Solo cache temporal | Crece con usuarios |

### ¿Por qué JWT para nuestro proyecto?

- Es una **API REST** que necesita escalar
- Queremos preparar para **mobile** después
- Minimiza carga de servidor (stateless)
- Estándar en industria actual

### ¿Por qué NO solo JWT?

- Sin forma de "revocar inmediatamente" un token
- Si alguien roba un token, es válido hasta expiración

### Solución: **Híbrido JWT + Blacklist**

- JWT para performance
- Redis blacklist para logout inmediato
- Mejor de ambos mundos

---

## Arquitectura en 3 capas

```
┌─────────────────────────────────────┐
│  USUARIO INICIA SESIÓN              │
│  email + password                   │
└──────────────┬──────────────────────┘
               ▼
       ¿Credenciales válidas?
       /    |    \
      /     |     \
    X     X       OK
   401   401     Generar JWT
             /      \
      accessToken  refreshToken
      (15 min)     (7 días)
      header       cookie
     Memory        Secure
            \      /
             ▼▼▼▼▼▼
          ← Usuario autenticado →
             
             ▼ Cada request siguiente:
      
    Include: Authorization: Bearer TOKEN
             
             ▼ En servidor:
             
    NIVEL 1: ¿TOKEN VÁLIDO?
    ├─ Verificar firma ✅
    ├─ ¿No está en blacklist? ✅
    ├─ ¿No expiró? ✅
    └─ → Usuario autenticado (req.user)
    
             ▼
             
    NIVEL 2: ¿TIENE PERMISO?
    ├─ Leer req.user.role
    ├─ ¿Role autorizado en ruta? ✅
    └─ → Usuario autorizado
    
             ▼
             
    NIVEL 3: EJECUTAR CONTROLADOR
    └─ Acceso a datos según rol
```

---

## Matriz de Roles (Simplificado)

```
                ADMIN       EMPLEADO       CLIENTE
────────────────────────────────────────────────────
Ver citas       ✅ Todas    ✅ Sus citas   ✅ Sus citas
Crear cita      ✅          ✅             ✅
Editar cita     ✅ Todas    ✅ Sus citas   ❌
Eliminar cita   ✅ Todas    ✅ Sus citas   ❌
────────────────────────────────────────────────────
Ver clientes    ✅ Todos    ✅ Sus clientes ❌
Crud clientes   ✅          ❌             ❌
────────────────────────────────────────────────────
Dashboard       ✅ Admin    ✅ Empleado    ❌
Reportes        ✅          ❌             ❌
```

---

## Flujo de ejemplo: Cliente agendando una cita

```
1. Cliente accede /agendar sin autenticar
   → 401 Unauthorized → Redirige a login

2. Login con: cliente@test.com / password456C
   → Servidor verifica contraseña con bcrypt
   → Genera:
      accessToken (JWT con role: CLIENTE)
      refreshToken (para renovar)
   → Response 200 OK

3. Cliente hace: POST /citas
   Header: "Authorization: Bearer eyJh..."
   
   Middleware verifyToken:
   ✅ Firma válida
   ✅ No expirado
   ✅ No está en blacklist
   ✅ req.user = {id: 123, email: cliente@test.com, role: CLIENTE}
   
   Middleware authorize(['CLIENTE', 'EMPLEADO']):
   ✅ role = CLIENTE → permitido
   
   Controlador creasCita():
   ✅ Crear cita con usuario_id = 123
   ✅ Response 201 Created

4. Cliente hace: GET /citas/todas
   → Middleware authorize(['ADMIN']) (solo admin ve todas)
   → 403 Forbidden
```

---

## Riesgos: Qué podría ir mal?

| Riesgo | Impacto | Nuestra defensa |
|--------|---------|---|
| Alguien adivina contraseña | Acceso sin permiso | Validación fuerte (bcrypt + validaciones) + Rate limit |
| Alguien roba el JWT | Acceso temporal | Expiración 15 minutos + HTTPS |
| SQL injection en login | BD comprometida | ORM + prepared statements |
| User_A accede a cita de User_B | Privacidad | Validar owner en cada GET/PUT/DELETE |
| Admin mantiene acceso tras salida | Riesgo | Logout agrega a blacklist inmediatamente |

---

## Decisiones técnicas justificadas

### 1. ¿Por qué httpOnly cookie para refreshToken?

```javascript
// ❌ MAL: En localStorage
localStorage.setItem('token', jwt)
// Si hay XSS, JS malintencionado lo roba directamente

// ✅ BIEN: En httpOnly cookie
Set-Cookie: refreshToken=jwt; HttpOnly; Secure; SameSite=Strict
// XSS no puede acceder (solo HTTP puede)
// CSRF está mitigado (SameSite)
```

### 2. ¿Por qué accessToken es corto (15 min)?

Si alguien lo roba:
- Malo: Tiene acceso 7 días (si fuera refreshToken)
- Mejor: Tiene acceso 15 minutos máximo
- Cliente renueva automáticamente con refreshToken seguro

### 3. ¿Por qué separar autenticación de autorización?

```javascript
// ❌ MAL: Juntos
if (jwt.role === 'ADMIN') doSomething()

// ✅ BIEN: Separados
middleware: verifyToken    // ¿Quién eres?
middleware: authorize      // ¿Qué puedes?
controller: doSomething    // Ejecutar
```

Razón: Si la verificación falla, no ejecutas nada peligroso.

---

## Números de seguridad clave

- JWT Access Token: 15 minutos
- JWT Refresh Token: 7 días
- Bcrypt rounds: 10 (balancea seguridad vs tiempo)
- Min password length: 8 caracteres
- Rate limit login: 5 intentos en 5 minutos
- Redis TTL: Auto-borra tokens revocados tras expiración

---

## Próximos pasos (Semana 10)

| Paso | Duración | Dependencias |
|------|----------|---|
| 1. Crear tablas usuarios/roles | 1-2h | Nada |
| 2. Implementar register/login | 2-3h | Paso 1 |
| 3. Crear middlewares | 1-2h | Paso 2 |
| 4. Proteger rutas existentes | 1-2h | Paso 3 |
| 5. Integrar en frontend | 2-3h | Pasos 2-4 |
| 6. Tests | 2-3h | Todo anterior |

**Total**: ~10-15 horas de implementación

---

## Conclusión

Elegimos JWT porque:
- Escalable (sin estado en servidor)
- API-nativa (estándar actual)
- Preparada para mobile

Mitigamos riesgos con:
- Blacklist para logout
- Tokens cortos (expiración)
- Almacenamiento seguro (httpOnly)
- Validaciones en capas (autenticación + autorización)

Resultado: Sistema seguro, escalable y mantenible.
