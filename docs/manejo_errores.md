# Documentación de Manejo de Errores - Semana 8

## Tipos de errores manejados

### 1. Errores de red (NetworkError)
**Situación**: Sin conexión a internet  
**Código**: `app.js` líneas 155-161  
**Manejo**:
```javascript
if (error instanceof TypeError && error.message.includes('fetch')) {
  mensaje = `Sin conexión a internet. No se pudo ${accion}.`;
}
```
**Feedback al usuario**: 
- Mensaje en ARIA live region: "Sin conexión a internet. No se pudo [acción]"
- Clase CSS: `status-error` (fondo rojo)

---

### 2. Timeout de peticiones
**Situación**: La petición tarda más de 10 segundos  
**Código**: `app.js` líneas 147-152  
**Manejo**:
```javascript
function fetchConTimeout(url, options = {}) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: La petición tardó demasiado')), TIMEOUT_MS)
    )
  ]);
}
```
**Feedback al usuario**:
- Mensaje: "La conexión es muy lenta. Intenta [acción] nuevamente."
- Botón vuelve a estado normal después de 3 segundos

---

### 3. HTTP 400 - Bad Request
**Situación**: Datos inválidos enviados al servidor  
**Código**: `routes/index.js` líneas 49-76  
**Validaciones**:
- ✅ Campos requeridos (cliente, fecha, hora)
- ✅ Formato de fecha: `YYYY-MM-DD`
- ✅ Formato de hora: `HH:MM`

**Respuesta del servidor**:
```json
{
  "success": false,
  "error": "Faltan campos requeridos",
  "details": "Se requieren: cliente, fecha, hora"
}
```

**Feedback al usuario**:
- Mensaje específico según validación fallida
- Campo marcado con `aria-invalid="true"`
- Clase CSS `.error` en el input

---

### 4. HTTP 404 - Not Found
**Situación**: Recurso no existe  
**Código**: `routes/index.js` líneas 121-127  
**Ejemplo**: Eliminar cita con ID inexistente

**Respuesta del servidor**:
```json
{
  "success": false,
  "error": "Cita no encontrada",
  "details": "No existe cita con ID 99999"
}
```

**Feedback al usuario**:
- Mensaje: "Error al eliminar: Cita no encontrada"
- Botón permanece visible (no se elimina del DOM)

---

### 5. HTTP 500 - Internal Server Error
**Situación**: Error interno del servidor  
**Código**: `routes/index.js` líneas 29-35, 101-107  
**Manejo**:
```javascript
try {
  // Operación
} catch (error) {
  res.status(500).json({
    success: false,
    error: 'Error interno al [acción]',
    details: error.message
  });
}
```

**Feedback al usuario**:
- Mensaje: "Error al [acción]: Error interno del servidor"
- Estado del botón: `error` (fondo rojo, animación shake)

---

### 6. Estados de carga accesibles

#### Estado: Loading
**Indicadores**:
- `aria-busy="true"` en el botón
- `disabled="true"` para prevenir doble click
- Texto: "Agregando..." o "Eliminando..."
- Spinner visible con `aria-hidden="true"`
- Clase CSS: `.loading`

**Código**: `app.js` líneas 235-240, `components.js` líneas 133-160

#### Estado: Success
**Indicadores**:
- Clase CSS: `.success` (fondo verde)
- Texto: "✓ Agregado"
- Animación: `pulse` (0.3s)
- ARIA live: "Cita creada exitosamente" (success)

**Código**: `app.js` líneas 241-244

#### Estado: Error
**Indicadores**:
- Clase CSS: `.error` (fondo rojo)
- Texto: "✗ Error"
- Animación: `shake` (0.5s)
- ARIA live: Mensaje específico del error (error)
- Botón vuelve a normal después de 3 segundos

**Código**: `app.js` líneas 245-250, `components.js` líneas 113-124

---

## Flujo de manejo de errores

### Frontend (app.js)
```
1. Usuario envía formulario
2. setEstadoFormulario('submitting') → aria-busy=true
3. try {
     fetchConTimeout() → API
     if (!response.ok) throw error
     setEstadoFormulario('success')
   }
4. catch (error) {
     setEstadoFormulario('error')
     manejarError(error)
   }
5. Volver a 'idle' después de 2-3 segundos
```

### Backend (routes/index.js)
```
1. Recibir petición
2. try {
     Validar datos
     Procesar
     Simular latencia 100-300ms
     Responder 200/201
   }
3. catch (error) {
     Responder 400/404/500 con JSON
   }
```

---

## Documentación en código

### Comentarios de errores en app.js (líneas 14-22)
```javascript
/**
 * Manejo de errores de red:
 * - NetworkError: Sin conexión a internet
 * - 400: Datos inválidos enviados
 * - 404: Recurso no encontrado
 * - 500: Error interno del servidor
 * - Timeout: Petición tarda más de 10 segundos
 */
```

### Comentarios de errores en routes/index.js
- Líneas 16-19: GET /api/citas
- Líneas 36-39: POST /api/citas
- Líneas 108-111: DELETE /api/citas/:id

Cada ruta documenta qué errores maneja.

---

## Tests de manejo de errores

### API Tests (tests/api.test.js)
- ✅ 13 tests de API
- ✅ Validación de campos requeridos (3 tests)
- ✅ Validación de formatos (2 tests)
- ✅ Manejo de 404 (1 test)
- ✅ Manejo de 400 (3 tests)
- ✅ Manejo de 500 (1 test)

### Frontend Tests
- ✅ Mock de fetch en components.test.js
- ✅ Mock de fetch en keyboard.test.js
- ✅ Tests de estados de carga

**Total**: 51 tests pasando

---

## Ejemplos de uso

### Crear cita con error de validación
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Juan","fecha":"2026-03-20"}'

# Respuesta 400:
{
  "success": false,
  "error": "Faltan campos requeridos",
  "details": "Se requieren: cliente, fecha, hora"
}
```

### Eliminar cita inexistente
```bash
curl -X DELETE http://localhost:3000/api/citas/99999

# Respuesta 404:
{
  "success": false,
  "error": "Cita no encontrada",
  "details": "No existe cita con ID 99999"
}
```

### Simular sin conexión
En el navegador, abrir DevTools → Network → Offline → Intentar crear cita

Resultado: "Sin conexión a internet. No se pudo crear cita."

---

## Cumplimiento de entregables

✅ **Consumo de API funcional** (6 pts)
- GET, POST, DELETE implementados
- fetch() con try/catch
- Datos persisten en memoria

✅ **Estados de carga accesibles**
- aria-busy, aria-label
- Spinner animado
- Anuncios ARIA

✅ **Manejo de errores documentado** (3 pts)
- 6 tipos de errores manejados
- Comentarios en código
- Esta documentación

✅ **Tests**
- 51 tests pasando
- Cobertura: 81.97%

---

**Fecha**: 20 de febrero de 2026  
**Asignatura**: Semana 8 - Comunicación asíncrona accesible  
**Valor**: 9 puntos
