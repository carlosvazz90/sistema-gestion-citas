# Sistema de Gestion de Citas

Aplicacion web accesible con Node.js para negocios locales.

## Caracteristicas principales

- Login seguro, accesible y controlado por teclado
- API REST funcional (GET, POST, DELETE)
- Comunicacion asincrona con fetch()
- Estados de carga accesibles (ARIA)
- Navegacion por teclado completa
- Tests automatizados (66 tests)
- CI/CD con GitHub Actions

## Tecnologias

- Backend: Node.js 18+ + Express 4.18
- Testing: Jest + Supertest + jsdom
- Frontend: JavaScript vanilla
- Accesibilidad: ARIA live regions
- DevOps: Docker + GitHub Actions

## Ejecucion en local

cd backend / npm install / npm run dev

Corre en: http://localhost:3000

## Credenciales de prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@ejemplo.com | admin123 | admin |
| usuario@ejemplo.com | usuario123 | usuario |

## Autenticacion

- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/verify

## Tests

cd backend && npm test

66 tests pasando.
