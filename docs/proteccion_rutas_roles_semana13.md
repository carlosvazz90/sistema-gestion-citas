# Semana 13 - Protección de rutas y recursos por rol

## 1) ¿Qué es un middleware?
Un middleware es una función intermedia que se ejecuta antes de que una petición llegue a la lógica principal de una ruta.

En Express sirve para:
- leer encabezados o cookies,
- validar autenticación,
- verificar permisos,
- detener la petición si no cumple una regla.

En esta semana se usó middleware para dos niveles:
- autenticación: confirmar que existe una sesión válida,
- autorización: validar si el rol del usuario puede entrar al recurso.

## 2) ¿Cómo se protegen rutas en backend?
Las rutas se protegen colocando validaciones antes del controlador.

Patrón aplicado:
1. El cliente inicia sesión.
2. El servidor crea una sesión y genera un token.
3. El token queda disponible para API en `Authorization: Bearer ...` y también en cookie segura para navegación web.
4. Cada petición a rutas privadas pasa por middleware.
5. Si no hay sesión válida, el acceso se bloquea.

Ejemplo real del proyecto:
- `verificarAutenticacion`: protege rutas API.
- `verificarRol(['admin'])`: limita acciones sensibles solo al administrador.
- `protegerVista([...])`: protege vistas HTML y evita accesos directos a recursos privados.

## 3) ¿Qué errores de seguridad son comunes?
Errores frecuentes:
- dejar rutas privadas sin autenticación,
- confiar solo en ocultar botones en frontend,
- permitir acceso directo a archivos HTML protegidos,
- no validar el rol en acciones críticas,
- exponer mensajes que revelan demasiado,
- mantener sesiones activas después de cambios sensibles.

Riesgos directos:
- acceso a información por usuarios no autorizados,
- eliminación de datos por roles incorrectos,
- escalación de privilegios,
- pérdida de confianza en el sistema.

## 4) ¿Cómo se valida acceso por rol?
Se valida leyendo el rol asociado a la sesión autenticada.

Flujo aplicado:
1. Middleware recupera el token desde header o cookie.
2. Se busca la sesión activa.
3. Se asigna el usuario autenticado a `req.usuario`.
4. Otro middleware compara `req.usuario.role` contra los roles permitidos.
5. Si el rol no coincide, responde `403 Forbidden`.

Ejemplo:
- `admin`: acceso a gestión de clientes y eliminación de citas.
- `usuario`: acceso a dashboard y consultas de citas, pero sin permisos administrativos.

## Implementación realizada
Se aplicaron estos cambios en backend:

- Protección de API de citas:
  - `GET /api/citas` requiere autenticación.
  - `POST /api/citas` requiere autenticación.
  - `DELETE /api/citas/:id` requiere autenticación y rol `admin`.

- Protección de vistas:
  - `/dashboard` solo para usuarios autenticados.
  - `/citas` solo para usuarios autenticados.
  - `/clientes` solo para rol `admin`.

- Bloqueo de acceso directo a recursos:
  - `/dashboard.html` y `/citas.html` ya no quedan públicos.
  - si no existe sesión válida, el servidor bloquea el acceso.

- Sesión reutilizada para web y API:
  - login genera sesión en memoria,
  - el token se guarda para API,
  - también se envía en cookie para proteger navegación por URL.

## Evidencia de bloqueo de accesos indebidos
Casos cubiertos:
- usuario sin sesión intenta entrar a `/dashboard` y recibe bloqueo.
- usuario sin sesión intenta abrir `/dashboard.html` o `/citas.html` y recibe bloqueo.
- usuario con rol `usuario` intenta entrar a `/clientes` y recibe `403`.
- usuario con rol `usuario` intenta eliminar una cita y recibe `403`.

## Tests de seguridad agregados
Archivo principal de evidencia:
- `backend/tests/security.test.js`

Además se actualizaron:
- `backend/tests/api.test.js`
- `backend/tests/routes.test.js`

Validaciones automatizadas incluidas:
- rechazo por falta de autenticación,
- rechazo por rol insuficiente,
- protección de vistas privadas,
- protección de recursos HTML directos,
- confirmación de acceso válido para rol correcto.

## Conclusión
La seguridad no depende solo del frontend.
El cierre correcto del sistema ocurre cuando el backend verifica sesión, rol y recurso solicitado en cada acceso importante.

Con esta implementación el sistema queda mejor protegido contra accesos indebidos, navegación directa no autorizada y acciones administrativas ejecutadas por usuarios sin permisos.