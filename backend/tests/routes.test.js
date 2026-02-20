const request = require('supertest');
const app = require('../src/app');

describe('Pruebas de rutas básicas', () => {
  test('GET / debe retornar información de la API en JSON', async () => {
    const res = await request(app)
      .get('/')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body).toHaveProperty('rutas');
  });

  test('GET / debe retornar HTML con menú y breadcrumbs', async () => {
    const res = await request(app)
      .get('/')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Menú principal');
    expect(res.text).toContain('breadcrumbs');
    expect(res.text).toContain('Sistema de Gestión de Citas');
  });

  test('GET /login debe retornar HTML con navegación', async () => {
    const res = await request(app)
      .get('/login')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Iniciar Sesión');
    expect(res.text).toContain('Menú principal');
    expect(res.text).toContain('breadcrumbs');
  });

  test('GET /registro debe retornar HTML', async () => {
    const res = await request(app)
      .get('/registro')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Crear Cuenta');
  });

  test('GET /agendar debe retornar HTML', async () => {
    const res = await request(app)
      .get('/agendar')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Agendar Cita');
  });
});

describe('Pruebas de navegación accesible', () => {
  test('Menú debe tener role navigation', async () => {
    const res = await request(app)
      .get('/')
      .set('Accept', 'text/html');
    expect(res.text).toContain('role="navigation"');
    expect(res.text).toContain('aria-label="Menú principal"');
  });

  test('Breadcrumbs deben ser navegables por teclado', async () => {
    const res = await request(app)
      .get('/login')
      .set('Accept', 'text/html');
    expect(res.text).toContain('tabindex="0"');
    expect(res.text).toContain('aria-label="Ruta de navegación"');
  });

  test('Enlaces del menú deben tener tabindex', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Accept', 'text/html');
    expect(res.text).toContain('tabindex="0"');
  });
});

describe('Pruebas de manejo de errores', () => {
  test('Ruta inexistente debe retornar 404 JSON', async () => {
    const res = await request(app)
      .get('/ruta-inexistente')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('mensaje');
  });

  test('Ruta inexistente debe retornar 404 HTML con accesibilidad', async () => {
    const res = await request(app)
      .get('/ruta-inexistente')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('aria-live');
    expect(res.text).toContain('Página no encontrada');
  });

  test('Mensaje de error 404 debe ser descriptivo', async () => {
    const res = await request(app)
      .get('/no-existe')
      .set('Accept', 'application/json');
    expect(res.body.mensaje).toContain('No encontrado');
  });

  test('Página 404 debe incluir menú de navegación', async () => {
    const res = await request(app)
      .get('/no-existe')
      .set('Accept', 'text/html');
    expect(res.text).toContain('Volver al inicio');
  });
});

describe('Pruebas de rutas privadas', () => {
  test('GET /dashboard debe retornar HTML', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Dashboard');
  });

  test('GET /citas debe retornar HTML', async () => {
    const res = await request(app)
      .get('/citas')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Gestión de Citas');
  });

  test('GET /clientes debe retornar HTML', async () => {
    const res = await request(app)
      .get('/clientes')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Gestión de Clientes');
  });
});
