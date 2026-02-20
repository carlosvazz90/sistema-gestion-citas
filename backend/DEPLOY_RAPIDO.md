# Deploy Rápido - Railway (Recomendado)

## ⚡ Opción más rápida: Railway

Railway es la opción más simple para obtener una URL pública en menos de 5 minutos.

### 1. Crear cuenta en Railway

Ir a: https://railway.app
- Click en "Start a New Project"
- Login con GitHub

### 2. Deploy desde GitHub

```
1. Click "Deploy from GitHub repo"
2. Seleccionar el repositorio: sistema-gestion-citas
3. Click "Deploy Now"
4. Railway detecta automáticamente que es Node.js
5. En 2-3 minutos estará listo
```

### 3. Obtener URL pública

```
1. En el dashboard de Railway, click en tu proyecto
2. Click en "Settings"
3. Buscar "Domains"
4. Click "Generate Domain"
5. Se genera algo como: sistema-gestion-citas-production.up.railway.app
```

### 4. Probar

Visitar:
```
https://tu-app.up.railway.app/citas.html
```

---

## 🎯 Alternativa: Render (Gratis permanente)

Render ofrece tier gratuito permanente.

### 1. Crear cuenta

Ir a: https://render.com
- Sign up con GitHub

### 2. Crear Web Service

```
1. Dashboard → "New +" → "Web Service"
2. Conectar repositorio GitHub
3. Configurar:
   - Name: sistema-gestion-citas
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Plan: Free
4. Click "Create Web Service"
5. Esperar 5-10 minutos (primera vez es más lento)
```

### 3. URL generada

Render genera algo como:
```
https://sistema-gestion-citas.onrender.com
```

**Nota**: En plan gratuito, si no hay tráfico por 15 minutos, el servicio se "duerme" y tarda ~30 segundos en despertar la próxima visita.

---

## 📋 Verificar deployment exitoso

Una vez desplegado en cualquier plataforma, verificar:

### 1. Health check
```bash
curl https://tu-app.onrender.com/
```
Debe devolver HTML de la página de inicio.

### 2. API funciona
```bash
curl https://tu-app.onrender.com/api/citas
```
Debe devolver:
```json
{
  "success": true,
  "data": [],
  "total": 0
}
```

### 3. Crear cita
```bash
curl -X POST https://tu-app.onrender.com/api/citas \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Test","fecha":"2026-03-20","hora":"10:00"}'
```
Debe devolver 201 Created.

### 4. Frontend funciona
Abrir en navegador:
```
https://tu-app.onrender.com/citas.html
```

---

## 🐛 Solución de problemas comunes

### Error: "Application failed to respond"
- **Causa**: El servidor no está escuchando en el puerto correcto
- **Solución**: Asegúrate de que `server.js` usa `process.env.PORT`
- **Verificar**: Ya está configurado correctamente en línea 3 de `server.js`

### Error: "Build failed"
- **Causa**: Falta `package.json` o dependencias incorrectas
- **Solución**: Verificar que el `package.json` tenga todas las dependencias
- **Status**: ✅ Ya está correcto

### Error 500 al cargar `/citas.html`
- **Causa**: Archivos estáticos no se sirven correctamente
- **Solución**: Verificar que `app.js` tiene `express.static`
- **Status**: ✅ Ya está configurado en línea 14 de `src/app.js`

---

## 📦 Lo que ya está listo para deploy

✅ `package.json` con scripts correctos  
✅ `server.js` usa `process.env.PORT`  
✅ Dependencias en producción (no devDependencies)  
✅ Sin archivos hardcodeados (todo configurable)  
✅ `engines` especifica Node 18+  
✅ Tests pasan (51/51)  

---

## 🎓 Para entregar al profesor

**URL de deployment**: `https://[tu-app].[plataforma].com`

**Endpoints a mostrar**:
1. Frontend: `/citas.html`
2. API GET: `/api/citas`
3. API POST: `/api/citas` (usar Postman/cURL)
4. Error 404: `/xyz`
5. Error 500: `/error-500`

**Documentación de errores**: `docs/manejo_errores.md`

---

**Tiempo estimado de deploy**: 5-10 minutos  
**Costo**: $0 (planes gratuitos)  
**Recomendación**: Railway por velocidad, Render por estabilidad
