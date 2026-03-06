# Diagrama de Autenticación y Roles

## Flujo Completo de Autenticación

1. Usuario ingresa email + contraseña → POST /login

2. Servidor valida credenciales:
   - Busca usuario en BD por email
   - Compara password_hash con bcrypt
   - Si es inválido → responde 401
   - Si es válido → genera tokens

3. Servidor crea:
   - accessToken (válido 15 minutos)
   - refreshToken (válido 7 días)

4. Cliente almacena:
   - accessToken en memoria (localStorage)
   - refreshToken en cookie httpOnly

5. Siguientes requests:
   - Cliente incluye: Authorization: Bearer accessToken
   - Servidor verifica token

6. Middleware valida:
   - Extrae token del header
   - Verifica firma con JWT_SECRET
   - Valida que no expiró
   - Extrae el rol
   - Si todo ok → autoriza la ruta

## Matriz de Roles y Permisos

RUTA          ADMIN      EMPLEADO       CLIENTE
-----------   -------    ----------     --------
/login        SI         SI             SI
/registro     SI         NO             SI

/citas        CRUD       CRUD*          READ+
(todas)       (propias)  (propias)      +CREATE

/clientes     CRUD       READ*          NO
(todos)       (suyos)

/dashboard    SI         SI             NO
/reportes     SI         NO             NO

* = Con restricción adicional

## Arquitectura de Seguridad en Capas

NIVEL 1: AUTENTICACIÓN (¿Quién eres?)
- Middleware verifyToken()
- Extrae token del header
- Verifica firma con JWT_SECRET
- Valida expiración
- Extrae datos (id, email, role)
- Resultado: usuario autenticado en req.user

NIVEL 2: AUTORIZACIÓN (¿Qué puedes hacer?)
- Middleware authorize(rolesPermitidos)
- Lee req.user.role
- Valida si tiene permisos
- Permite o rechaza

NIVEL 3: CONTROLADOR
- Ejecuta la lógica del negocio
- Solo llega aquí si pasó niveles 1 y 2

Ejemplo ruta:
  GET /citas
    → verifyToken (Nivel 1)
    → authorize(['ADMIN']) (Nivel 2)
    → controladorCitas (Nivel 3)

## Flujo de Logout y Invalidación

1. Usuario hace POST /logout

2. Servidor:
   - Lee token del header Authorization
   - Agrega a "blacklist" en Redis
   - Define TTL = tiempo hasta expiración del token
   - Elimina cookie

3. Respuesta: 200 OK

4. Cliente:
   - Elimina localStorage
   - Redirije a login

5. Siguiente request con ese token:
   - Middleware verifica si está en blacklist
   - Rechaza con 401

## Almacenamiento de Tokens

CLIENTE (Frontend)

accessToken (15 minutos)
- Se almacena en localStorage (en memoria)
- Acceso rápido
- Riesgo: Si hay XSS, se puede robar

refreshToken (7 días)
- Se almacena en Cookie httpOnly
- No accesible desde JavaScript (protección contra XSS)
- Se envía automático en cada request
- Protegido con SameSite=Strict (CSRF)

Ventajas de esta estrategia:
- accessToken es corto (15 min) = menor riesgo si se roba
- refreshToken está seguro en httpOnly cookie
- Si un atacante roba accessToken, solo tiene 15 minutos
- refreshToken está protegido de JavaScript malicioso
