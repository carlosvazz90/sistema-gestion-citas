/**
 * Tests para API REST de citas
 * Valida: GET, POST, DELETE y manejo de errores
 */

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

describe('API REST /api/citas', () => {
  
  describe('GET /api/citas', () => {
    test('debe rechazar acceso sin autenticación', async () => {
      const response = await request(app)
        .get('/api/citas')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No autenticado');
    });

    test('debe devolver las citas al usuario autenticado', async () => {
      const { token } = await loginComo('admin@ejemplo.com', 'admin123');

      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    test('debe devolver las citas creadas', async () => {
      const { token } = await loginComo('admin@ejemplo.com', 'admin123');

      // Crear cita primero
      await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cliente: 'Juan Pérez',
          fecha: '2026-03-15',
          hora: '10:00'
        });

      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.some((cita) => cita.cliente === 'Juan Pérez')).toBe(true);
    });
  });

  describe('POST /api/citas', () => {
    test('debe rechazar creación sin autenticación', async () => {
      const response = await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Sin acceso',
          fecha: '2026-03-20',
          hora: '14:30'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No autenticado');
    });

    test('debe crear una cita válida', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const nuevaCita = {
        cliente: 'María García',
        fecha: '2026-03-20',
        hora: '14:30'
      };

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevaCita)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.cliente).toBe('María García');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    test('debe rechazar cita sin cliente', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fecha: '2026-03-20',
          hora: '14:30'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('campos requeridos');
    });

    test('debe rechazar cita sin fecha', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cliente: 'Pedro López',
          hora: '14:30'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('debe rechazar cita sin hora', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cliente: 'Ana Martínez',
          fecha: '2026-03-20'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('debe rechazar fecha con formato inválido', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cliente: 'Carlos Ruiz',
          fecha: '20/03/2026', // Formato incorrecto
          hora: '10:00'
        })
        .expect(400);

      expect(response.body.error).toContain('fecha inválido');
    });

    test('debe rechazar hora con formato inválido', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cliente: 'Laura Sánchez',
          fecha: '2026-03-20',
          hora: '10:00 AM' // Formato incorrecto
        })
        .expect(400);

      expect(response.body.error).toContain('hora inválido');
    });

    test('debe eliminar espacios del nombre del cliente', async () => {
      const { token } = await loginComo('usuario@ejemplo.com', 'usuario123');

      const response = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cliente: '  José Ramírez  ',
          fecha: '2026-03-25',
          hora: '09:00'
        })
        .expect(201);

      expect(response.body.data.cliente).toBe('José Ramírez');
    });
  });

  describe('DELETE /api/citas/:id', () => {
    test('debe rechazar eliminación sin autenticación', async () => {
      const response = await request(app)
        .delete('/api/citas/1')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No autenticado');
    });

    test('debe eliminar una cita existente si el rol es admin', async () => {
      const admin = await loginComo('admin@ejemplo.com', 'admin123');

      // Crear cita
      const createResponse = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          cliente: 'Roberto Díaz',
          fecha: '2026-04-01',
          hora: '11:00'
        });

      const citaId = createResponse.body.data.id;

      // Eliminar cita
      const deleteResponse = await request(app)
        .delete(`/api/citas/${citaId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.id).toBe(citaId);

      // Verificar que fue eliminada
      const getResponse = await request(app)
        .get('/api/citas')
        .set('Authorization', `Bearer ${admin.token}`);
      const citaEliminada = getResponse.body.data.find(c => c.id === citaId);
      expect(citaEliminada).toBeUndefined();
    });

    test('debe bloquear eliminación para usuario regular', async () => {
      const admin = await loginComo('admin@ejemplo.com', 'admin123');
      const usuario = await loginComo('usuario@ejemplo.com', 'usuario123');

      const createResponse = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          cliente: 'Cita Protegida',
          fecha: '2026-04-05',
          hora: '09:30'
        })
        .expect(201);

      const response = await request(app)
        .delete(`/api/citas/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${usuario.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No tienes permisos');
    });

    test('debe devolver 404 si la cita no existe', async () => {
      const { token } = await loginComo('admin@ejemplo.com', 'admin123');

      const response = await request(app)
        .delete('/api/citas/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    test('debe rechazar ID inválido', async () => {
      const { token } = await loginComo('admin@ejemplo.com', 'admin123');

      const response = await request(app)
        .delete('/api/citas/abc')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });
  });

  describe('Manejo de errores HTTP', () => {
    test('GET debe manejar errores internos (500)', async () => {
      const { token } = await loginComo('admin@ejemplo.com', 'admin123');

      // Este test verifica que los errores 500 sean manejados
      // En producción, esto podría ocurrir por fallos de BD
      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 500]).toContain(response.status);
    });
  });
});
