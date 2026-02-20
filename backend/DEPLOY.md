# Sistema de Gestión de Citas - Deploy

## Prerrequisitos
- Node.js 18 o superior
- npm 8 o superior

## Variables de entorno

Crear archivo `.env` con:
```env
PORT=3000
NODE_ENV=production
```

## Instalación

```bash
npm install
```

## Ejecución local

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start
```

## Tests

```bash
# Ejecutar todos los tests
npm test

# Solo tests de API
npm test -- tests/api.test.js

# Solo tests de componentes
npm test -- tests/components.test.js
```

## Deploy en Render

### Opción 1: Desde GitHub

1. Crear repositorio en GitHub con el código
2. Ir a [Render](https://render.com) y crear cuenta
3. Crear nuevo "Web Service"
4. Conectar con GitHub
5. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Oregon (más cercano)

### Opción 2: Render CLI

```bash
# Instalar Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

## Deploy en Railway

1. Ir a [Railway](https://railway.app)
2. Crear nuevo proyecto desde GitHub
3. Railway detecta automáticamente Node.js
4. Se despliega automáticamente

### Variables de entorno en Railway
```
PORT: (Railway lo asigna automáticamente)
NODE_ENV: production
```

## Deploy en Heroku (alternativa)

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create nombre-app

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

## Verificar deployment

Una vez desplegado, verificar:

1. **Health check**: `GET https://tu-app.onrender.com/`
2. **API citas**: `GET https://tu-app.onrender.com/api/citas`
3. **Crear cita**: `POST https://tu-app.onrender.com/api/citas`
4. **Frontend**: `https://tu-app.onrender.com/citas.html`

## Estructura de archivos importantes

```
backend/
├── src/
│   ├── app.js              # Configuración Express
│   ├── routes/
│   │   └── index.js        # Rutas API + HTML
│   └── middlewares/
│       └── errorHandler.js # Manejo de errores
├── public/
│   ├── js/
│   │   ├── app.js          # Frontend con fetch
│   │   └── components.js   # Componentes UI
│   └── citas.html          # Interfaz principal
├── tests/                  # 51 tests
├── server.js               # Punto de entrada
├── package.json            # Dependencias
└── Dockerfile              # Para Docker (opcional)
```

## Solución de problemas

### Puerto en uso
```bash
# Windows
Get-Process -Name node | Stop-Process -Force

# Linux/Mac
killall node
```

### Error de módulos
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tests fallan
```bash
npm test -- --clearCache
npm test
```

## Mantenimiento

- La API usa almacenamiento en memoria (los datos se pierden al reiniciar)
- Para persistencia, agregar una base de datos en futuras versiones
- Los logs se muestran en la consola del servidor

## Contacto

Para soporte, crear un issue en el repositorio.
