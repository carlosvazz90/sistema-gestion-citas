# Semana 12 - Recuperación de contraseñas accesible y segura

## 1) ¿Qué es un token de recuperación?
Un token de recuperación es un valor aleatorio, único y temporal que permite verificar que la persona que solicita recuperar la cuenta tiene acceso al canal de recuperación (correo, por ejemplo).

En esta implementación:
- El token se genera con `crypto.randomBytes(32)`.
- El sistema guarda solo un hash (`sha256`) del token.
- El token real se usa una sola vez para cambiar la contraseña.

## 2) ¿Por qué deben expirar los tokens?
Porque reducen la ventana de ataque.
Si un token se filtra o es interceptado, su tiempo útil es corto.

En esta implementación:
- Expiración de 15 minutos.
- Tokens vencidos o usados se eliminan.

## 3) ¿Qué ataques existen en flujos de recuperación?
- Enumeración de cuentas: detectar si un correo existe por mensajes distintos.
- Reutilización de token: usar el mismo token varias veces.
- Token robado: usar un token capturado antes de que expire.
- Fuerza bruta de token: intentar adivinar tokens débiles.
- Secuestro de sesión posterior al cambio de contraseña.

Mitigaciones aplicadas:
- Mensaje no revelador en solicitud (mismo mensaje para correo existente o no).
- Token aleatorio fuerte y largo.
- Expiración corta (15 min).
- Token de un solo uso.
- Cierre de sesiones activas al cambiar contraseña.

## 4) ¿Cómo se diseña un flujo accesible para recuperación de acceso?
- Formularios por pasos claros: solicitud, validación, cambio.
- Etiquetas (`label`) asociadas a cada campo.
- Mensajes con `aria-live` para lector de pantalla.
- Errores por campo con `aria-invalid` y texto claro.
- Navegación por teclado y foco visible.
- Mensajes sin filtrar información sensible.

## Implementación realizada
Flujo completo funcional:
1. Solicitud: `POST /api/auth/password/request`
2. Validación: `POST /api/auth/password/validate`
3. Cambio: `POST /api/auth/password/reset`

Componentes agregados:
- Página de recuperación: `/recuperar`
- Vista: `backend/public/recuperar.html`
- Script: `backend/public/js/recover.js`

## Evidencia funcional
- Pruebas automatizadas en `backend/tests/auth.test.js` para:
  - mensaje no revelador,
  - validación de token,
  - cambio de contraseña,
  - rechazo de reutilización de token.

## Conclusión
La recuperación de contraseña es un flujo crítico de seguridad.
Un diseño correcto debe equilibrar protección (tokens seguros y expiración) con accesibilidad y buena experiencia de usuario.
