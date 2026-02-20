# Sistema de Gestión de Citas

Aplicación web accesible desarrollada con Node.js que permite a negocios locales administrar citas de manera organizada y digital.

## 🚀 Características principales

- ✅ API REST funcional (GET, POST, DELETE)
- ✅ Comunicación asíncrona con fetch()
- ✅ Estados de carga accesibles (ARIA)
- ✅ Manejo robusto de errores de red
- ✅ Componentes dinámicos sin recargar página
- ✅ Navegación por teclado completa
- ✅ Tests automatizados (51 tests, 81.97% cobertura)
- ✅ CI/CD con GitHub Actions

## 🛠 Tecnologías utilizadas

- **Backend**: Node.js 18+ + Express 4.18
- **Testing**: Jest + Supertest + jsdom
- **Frontend**: JavaScript vanilla con fetch API
- **Accesibilidad**: ARIA live regions, estados accesibles
- **DevOps**: Docker + GitHub Actions

## 📁 Estructura del proyecto

```
sistema-gestion-citas/
│
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuración Express
│   │   ├── routes/
│   │   │   └── index.js        # API REST + rutas HTML
│   │   └── middlewares/
│   │       └── errorHandler.js # Manejo 404/500
│   ├── public/
│   │   ├── js/
│   │   │   ├── app.js          # Consumo de API
│   │   │   └── components.js   # Componentes UI
│   │   ├── img/                # Imágenes de error
│   │   └── citas.html          # Interfaz principal
│   ├── tests/                  # 51 tests
│   │   ├── api.test.js         # Tests de API REST
│   │   ├── components.test.js  # Tests de UI
│   │   ├── keyboard.test.js    # Tests de teclado
│   │   └── routes.test.js      # Tests de rutas
│   ├── server.js               # Punto de entrada
│   ├── package.json
│   ├── Dockerfile
│   └── DEPLOY.md               # Guía de deployment
│
├── docs/
│   ├── manejo_errores.md       # Documentación de errores (Semana 8)
│   ├── definicion_proyecto.md
│   └── investigacion_comparativa.md
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
│
└── README.md
```

## 🏃 Ejecución en local

### Clonar repositorio

```bash
git clone <url-repositorio>
cd sistema-gestion-citas
```

### Instalar y ejecutar

```bash
cd backend
npm install
npm run dev
```

El servidor correrá en http://localhost:3000

### Rutas disponibles

- **Interfaz**: http://localhost:3000/citas.html
- **API citas**: http://localhost:3000/api/citas
- **Error 404**: http://localhost:3000/xyz
- **Error 500**: http://localhost:3000/error-500

## 🧪 Tests

```bash
cd backend

# Todos los tests
npm test

# Solo API
npm test -- tests/api.test.js

# Solo componentes
npm test -- tests/components.test.js

# Solo teclado
npm test -- tests/keyboard.test.js
```

**Resultado**: 51 tests | 81.97% cobertura

## Pruebas

Ejecutar tests:

```bash
cd backend
npm test
```

## Rutas disponibles

### Rutas públicas
- `GET /` - Información general de la API
- `GET /login` - Inicio de sesión
- `GET /registro` - Registro de usuarios
- `GET /agendar` - Agendar citas

### Rutas privadas
- `GET /dashboard` - Panel principal
- `GET /citas` - Gestión de citas
- `GET /clientes` - Gestión de clientes

### Manejo de errores
- Rutas no encontradas retornan error 404
- Errores del servidor retornan error 500

## Ejecución con Docker

```bash
docker build -t sistema-citas .
docker run -p 3000:3000 sistema-citas
```

## Estrategia de commits sugerida

- "Estructura inicial del proyecto"
- "Configuración de Express y servidor base"
- "Configuración Docker"
- "Implementación pipeline CI/CD"
- "Documentación README inicial"
