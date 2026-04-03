const request = require('supertest');
const app = require('../src/app');

async function loginComo(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.headers['set-cookie'][0].split(';')[0];
}

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

  test('GET /login debe retornar página de login HTML', async () => {
    const res = await request(app)
      .get('/login')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Login');
    expect(res.text).toContain('loginForm');
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
    const cookie = await loginComo('usuario@ejemplo.com', 'usuario123');

    const res = await request(app)
      .get('/citas')
      .set('Cookie', cookie)
      .set('Accept', 'text/html');
    expect(res.text).toContain('tabindex="0"');
  });

  test('Enlaces del menú deben tener tabindex', async () => {
    const cookie = await loginComo('admin@ejemplo.com', 'admin123');

    const res = await request(app)
      .get('/dashboard')
      .set('Cookie', cookie)
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
  test('GET /dashboard debe bloquear acceso sin sesión', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Debes iniciar sesión');
  });

  test('GET /dashboard.html debe bloquear acceso directo al recurso estático', async () => {
    const res = await request(app)
      .get('/dashboard.html')
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Debes iniciar sesión');
  });

  test('GET /citas debe retornar HTML para usuario autenticado', async () => {
    const cookie = await loginComo('usuario@ejemplo.com', 'usuario123');

    const res = await request(app)
      .get('/citas')
      .set('Cookie', cookie)
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Gestión de Citas');
  });

  test('GET /clientes debe bloquear a usuario sin rol admin', async () => {
    const cookie = await loginComo('usuario@ejemplo.com', 'usuario123');

    const res = await request(app)
      .get('/clientes')
      .set('Cookie', cookie)
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(403);
    expect(res.text).toContain('Tu rol no tiene permisos');
  });

  test('GET /clientes debe retornar HTML para admin', async () => {
    const cookie = await loginComo('admin@ejemplo.com', 'admin123');

    const res = await request(app)
      .get('/clientes')
      .set('Cookie', cookie)
      .set('Accept', 'text/html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Gestión de Clientes');
  });
});
