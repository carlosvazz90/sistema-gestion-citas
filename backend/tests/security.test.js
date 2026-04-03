const request = require('supertest');
const app = require('../src/app');

async function loginComo(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    token: response.body.token,
    cookie: response.headers['set-cookie'][0].split(';')[0]
  };
}

describe('Pruebas de seguridad - rutas y recursos por rol', () => {
  test('debe bloquear dashboard sin sesión activa', async () => {
    const response = await request(app)
      .get('/dashboard')
      .set('Accept', 'text/html');

    expect(response.status).toBe(401);
    expect(response.text).toContain('Debes iniciar sesión');
  });

  test('debe bloquear acceso directo a citas.html sin autenticación', async () => {
    const response = await request(app)
      .get('/citas.html')
      .set('Accept', 'text/html');

    expect(response.status).toBe(401);
    expect(response.text).toContain('Debes iniciar sesión');
  });

  test('debe bloquear la vista de clientes a rol usuario', async () => {
    const usuario = await loginComo('usuario@ejemplo.com', 'usuario123');

    const response = await request(app)
      .get('/clientes')
      .set('Cookie', usuario.cookie)
      .set('Accept', 'text/html');

    expect(response.status).toBe(403);
    expect(response.text).toContain('Tu rol no tiene permisos');
  });

  test('debe bloquear eliminación de citas para rol usuario', async () => {
    const admin = await loginComo('admin@ejemplo.com', 'admin123');
    const usuario = await loginComo('usuario@ejemplo.com', 'usuario123');

    const createResponse = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        cliente: 'Seguridad Semana 13',
        fecha: '2026-04-10',
        hora: '13:00'
      })
      .expect(201);

    const response = await request(app)
      .delete(`/api/citas/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${usuario.token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('No tienes permisos');
  });
});