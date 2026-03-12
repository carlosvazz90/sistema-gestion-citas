const request = require('supertest');
const app = require('../src/app');

describe('Autenticación - API Auth', () => {

  describe('POST /api/auth/login', () => {
    
    test('Debe hacer login exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBe(1);
      expect(response.body.role).toBe('admin');
    });

    test('Debe hacer login exitosamente con credenciales de usuario regular', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario@ejemplo.com',
          password: 'usuario123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBe(2);
      expect(response.body.role).toBe('usuario');
    });

    test('Debe rechazar login sin email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'admin123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email y contraseña requeridos');
    });

    test('Debe rechazar login sin contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email y contraseña requeridos');
    });

    test('Debe rechazar login con email inválido sin filtrar información sensible', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@ejemplo.com',
          password: 'cualquiera'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email o contraseña inválidos');
    });

    test('Debe rechazar login con contraseña incorrecta sin filtrar información sensible', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'contraseñaIncorrecta'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email o contraseña inválidos');
    });

  });

  describe('POST /api/auth/logout', () => {

    test('Debe logout exitosamente con token válido', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      // Hacer logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.message).toBe('Sesión cerrada');
    });

    test('Debe rechazar logout sin token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No autenticado');
    });

    test('Debe rechazar logout con token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer tokenInvalido');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Sesión expirada');
    });

  });

  describe('GET /api/auth/verify', () => {

    test('Debe verificar sesión con token válido', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      // Verificar sesión
      const verifyResponse = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.usuario).toBeDefined();
      expect(verifyResponse.body.usuario.email).toBe('admin@ejemplo.com');
      expect(verifyResponse.body.usuario.role).toBe('admin');
    });

    test('Debe rechazar verificación sin token', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No autenticado');
    });

    test('Debe rechazar verificación con token expirado', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer tokenExpirado');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  describe('Validación de Accesibilidad y Seguridad', () => {

    test('Debe devolver el rol correcto en login admin', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      expect(response.body.role).toBe('admin');
    });

    test('Debe devolver el rol correcto en login usuario regular', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario@ejemplo.com',
          password: 'usuario123'
        });

      expect(response.body.role).toBe('usuario');
    });

    test('No debe revelar información sensible en errores de login inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@ejemplo.com',
          password: 'password'
        });

      // No debe indicar si el email existe o no
      expect(response.body.error).not.toContain('email');
      expect(response.body.error).not.toContain('existe');
      expect(response.body.error).toBe('Email o contraseña inválidos');
    });

  });

});
