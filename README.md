# Sistema de Gestion de Citas

Aplicacion web accesible desarrollada con Node.js que permite a negocios locales administrar citas de manera organizada y digital.

### Caracteristicas principales

- API REST funcional (GET, POST, DELETE)
- Comunicacion asincrona con fetch()
- Estados de carga accesibles (ARIA)
- Manejo robusto de errores de red
- Componentes dinamicos sin recargar pagina
- Navegacion por teclado completa
- Animaciones accesibles (respeta prefers-reduced-motion)
- Optimizacion de performance (transiciones especificas)
- Tests automatizados (51 tests, 82.17% cobertura)
- CI/CD con GitHub Actions

### Stack Tecnologico

- Backend: Node.js 18+ con Express 4.18
- Testing: Jest + Supertest + jsdom
- Frontend: JavaScript vanilla con fetch API
- Accesibilidad: ARIA live regions, estados accesibles
- DevOps: Docker + GitHub Actions

### Estructura del proyecto

```
sistema-gestion-citas/
│
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuracion Express
│   │   ├── routes/
│   │   │   └── index.js        # API REST + rutas HTML
│   │   └── middlewares/
│   │       └── errorHandler.js # Manejo 404/500
│   ├── public/
│   │   ├── js/
│   │   │   ├── app.js          # Consumo de API
│   │   │   └── components.js   # Componentes UI
│   │   ├── img/                # Imagenes de error
│   │   └── citas.html          # Interfaz principal
│   ├── tests/                  # 51 tests
│   │   ├── api.test.js         # Tests de API REST
│   │   ├── components.test.js  # Tests de UI
│   │   ├── keyboard.test.js    # Tests de teclado
│   │   └── routes.test.js      # Tests de rutas
│   ├── server.js               # Punto de entrada
│   ├── package.json
│   ├── Dockerfile
│   └── DEPLOY.md               # Guia de deployment
│
├── docs/
│   ├── manejo_errores.md       # Documentacion de errores
│   ├── optimizacion_performance.md
│   ├── definicion_proyecto.md
│   └── investigacion_comparativa.md
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
│
└── README.md
```

### Instalacion y ejecucion

Clonar repositorio:
```bash
git clone <url-repositorio>
cd sistema-gestion-citas
```

Instalar y ejecutar:
```bash
cd backend
npm install
npm run dev
```

El servidor correra en http://localhost:3000

### Rutas disponibles

- Pagina de citas: http://localhost:3000/citas
- API REST: http://localhost:3000/api/citas
- Error 404: http://localhost:3000/xyz
- Error 500: http://localhost:3000/error-500

### Tests

```bash
cd backend
npm test
```

Resultado: 51 tests aprobados, 82.17% de cobertura

### Rutas publicas
- GET / - Informacion general de la API
- GET /login - Inicio de sesion
- GET /registro - Registro de usuarios
- GET /agendar - Agendar citas

### Rutas privadas
- GET /dashboard - Panel principal
- GET /citas - Gestion de citas
- GET /clientes - Gestion de clientes

### Manejo de errores
- Rutas no encontradas retornan 404
- Errores internos retornan 500

### Docker

```bash
docker build -t sistema-citas .
docker run -p 3000:3000 sistema-citas
```
