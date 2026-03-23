# Semana 11 - Manejo de multisesiones y persistencia

## ¿Qué es una multisesión?
Es cuando un mismo usuario puede tener más de una sesión activa al mismo tiempo (por ejemplo, dos pestañas o dos dispositivos) sin que una sesión rompa a la otra.

## ¿Qué problemas surgen con sesiones concurrentes?
- Cierre de sesión en una pestaña que deja estado inválido en otra.
- Tokens vencidos que siguen guardados en el navegador.
- Inconsistencia entre lo que cree el cliente y lo que acepta el servidor.

## ¿Cómo se invalida una sesión?
- Invalidez individual: se elimina solo el token actual en logout normal.
- Invalidez global: se eliminan todas las sesiones del usuario con logout global.
- Invalidez por expiración: si el tiempo de vida termina, la sesión se elimina y ya no se acepta.

## ¿Qué riesgos hay si no se controla bien?
- Accesos no autorizados por tokens viejos.
- Errores de navegación por estado desincronizado entre pestañas.
- Fallos de seguridad al no cerrar correctamente sesiones activas.

## Implementación realizada
Backend:
- Se agregó limpieza de sesiones expiradas.
- Se mantiene multisesión por usuario (tokens diferentes activos en paralelo).
- Se agregó endpoint de recuperación: POST /api/auth/recover.
- Se agregó logout global con query all=true.

Frontend:
- Se guarda una sola estructura authSession en localStorage para evitar estados parciales.
- En dashboard se recupera sesión válida con /api/auth/recover.
- Se escucha el evento storage para sincronizar cierre de sesión entre pestañas.

## Flujo técnico (evidencia)
1. Login crea token + sessionId + expiresAt.
2. Cliente guarda authSession.
3. Dashboard llama /api/auth/recover para reanudar sesión válida.
4. Si token no es válido, limpia sesión local y redirige a login.
5. Logout normal cierra solo la sesión actual.
6. Logout con all=true cierra todas las sesiones del usuario.

## Pruebas agregadas
Archivo: backend/tests/auth.test.js
- Dos logins del mismo usuario generan sesiones distintas.
- Logout normal invalida solo el token actual.
- Logout global invalida todos los tokens del usuario.
- Recover acepta token válido y rechaza token inválido.

## Entregable individual
Implementación y testing de multisesión y recuperación de sesión en autenticación (backend + pruebas).
