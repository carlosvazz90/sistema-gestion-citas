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

    test('Debe cerrar solo la sesión actual y mantener otra sesión activa del mismo usuario', async () => {
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      const token1 = login1.body.token;
      const token2 = login2.body.token;

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const verifyToken1 = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token1}`);

      const verifyToken2 = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token2}`);

      expect(verifyToken1.status).toBe(401);
      expect(verifyToken2.status).toBe(200);
      expect(verifyToken2.body.success).toBe(true);
    });

    test('Debe cerrar todas las sesiones del usuario cuando se solicita logout global', async () => {
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario@ejemplo.com',
          password: 'usuario123'
        });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario@ejemplo.com',
          password: 'usuario123'
        });

      const token1 = login1.body.token;
      const token2 = login2.body.token;

      const logoutAll = await request(app)
        .post('/api/auth/logout?all=true')
        .set('Authorization', `Bearer ${token1}`);

      expect(logoutAll.status).toBe(200);
      expect(logoutAll.body.success).toBe(true);
      expect(logoutAll.body.message).toBe('Todas las sesiones cerradas');

      const verifyToken1 = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token1}`);

      const verifyToken2 = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token2}`);

      expect(verifyToken1.status).toBe(401);
      expect(verifyToken2.status).toBe(401);
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

  describe('POST /api/auth/recover', () => {
    test('Debe recuperar sesión válida con token activo', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ejemplo.com',
          password: 'admin123'
        });

      const recoverResponse = await request(app)
        .post('/api/auth/recover')
        .send({ token: loginResponse.body.token });

      expect(recoverResponse.status).toBe(200);
      expect(recoverResponse.body.success).toBe(true);
      expect(recoverResponse.body.token).toBe(loginResponse.body.token);
      expect(recoverResponse.body.usuario.email).toBe('admin@ejemplo.com');
      expect(recoverResponse.body.sessionId).toBeDefined();
      expect(recoverResponse.body.expiresAt).toBeDefined();
    });

    test('Debe rechazar recuperación con token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/recover')
        .send({ token: 'tokenInvalido' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Sesión inválida o expirada');
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

  describe('Recuperación de contraseña', () => {
    test('Debe responder con mensaje no revelador para email existente', async () => {
      const response = await request(app)
        .post('/api/auth/password/request')
        .send({ email: 'admin@ejemplo.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Si el correo existe, se enviaron instrucciones de recuperación');
      expect(response.body.recoveryToken).toBeDefined();
    });

    test('Debe responder con mensaje no revelador para email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/password/request')
        .send({ email: 'no-existe@ejemplo.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Si el correo existe, se enviaron instrucciones de recuperación');
      expect(response.body.recoveryToken).toBeUndefined();
    });

    test('Debe validar un token de recuperación vigente', async () => {
      const requestResponse = await request(app)
        .post('/api/auth/password/request')
        .send({ email: 'usuario@ejemplo.com' });

      const token = requestResponse.body.recoveryToken;

      const validateResponse = await request(app)
        .post('/api/auth/password/validate')
        .send({ token });

      expect(validateResponse.status).toBe(200);
      expect(validateResponse.body.success).toBe(true);
      expect(validateResponse.body.message).toBe('Token válido para cambio de contraseña');
    });

    test('Debe cambiar contraseña con token válido y permitir login con nueva contraseña', async () => {
      const requestResponse = await request(app)
        .post('/api/auth/password/request')
        .send({ email: 'usuario@ejemplo.com' });

      const token = requestResponse.body.recoveryToken;
      const nuevaPassword = 'usuario456';

      const resetResponse = await request(app)
        .post('/api/auth/password/reset')
        .send({ token, password: nuevaPassword });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.success).toBe(true);
      expect(resetResponse.body.message).toBe('Contraseña actualizada correctamente');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'usuario@ejemplo.com', password: nuevaPassword });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
    });

    test('Debe rechazar reutilización del mismo token después del cambio', async () => {
      const requestResponse = await request(app)
        .post('/api/auth/password/request')
        .send({ email: 'admin@ejemplo.com' });

      const token = requestResponse.body.recoveryToken;

      await request(app)
        .post('/api/auth/password/reset')
        .send({ token, password: 'admin456' })
        .expect(200);

      const secondReset = await request(app)
        .post('/api/auth/password/reset')
        .send({ token, password: 'admin789' });

      expect(secondReset.status).toBe(400);
      expect(secondReset.body.success).toBe(false);
      expect(secondReset.body.error).toBe('Token inválido o expirado');
    });
  });

});
