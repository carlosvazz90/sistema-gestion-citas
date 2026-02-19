# Sistema de Gestión de Citas

Aplicación web desarrollada con Node.js que permite a negocios locales administrar citas de manera organizada y digital.

## Tecnologías utilizadas

- Node.js
- Express
- Docker
- GitHub Actions (CI/CD)

## Estructura del proyecto

El sistema está dividido en `backend` y preparado para integración futura con frontend.

```
sistema-gestion-citas/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
└── README.md
```

## Ejecución en local

Clonar repositorio

Ejecutar:

```bash
cd backend
npm install
npm run dev
```

El servidor correrá en http://localhost:3000

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
