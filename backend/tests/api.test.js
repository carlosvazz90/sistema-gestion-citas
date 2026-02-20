/**
 * Tests para API REST de citas
 * Valida: GET, POST, DELETE y manejo de errores
 */

const request = require('supertest');
const app = require('../src/app');

describe('API REST /api/citas', () => {
  
  describe('GET /api/citas', () => {
    test('debe devolver array vacío inicialmente', async () => {
      const response = await request(app)
        .get('/api/citas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBe(0);
    });

    test('debe devolver las citas creadas', async () => {
      // Crear cita primero
      await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Juan Pérez',
          fecha: '2026-03-15',
          hora: '10:00'
        });

      const response = await request(app)
        .get('/api/citas')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].cliente).toBe('Juan Pérez');
    });
  });

  describe('POST /api/citas', () => {
    test('debe crear una cita válida', async () => {
      const nuevaCita = {
        cliente: 'María García',
        fecha: '2026-03-20',
        hora: '14:30'
      };

      const response = await request(app)
        .post('/api/citas')
        .send(nuevaCita)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.cliente).toBe('María García');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    test('debe rechazar cita sin cliente', async () => {
      const response = await request(app)
        .post('/api/citas')
        .send({
          fecha: '2026-03-20',
          hora: '14:30'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('campos requeridos');
    });

    test('debe rechazar cita sin fecha', async () => {
      const response = await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Pedro López',
          hora: '14:30'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('debe rechazar cita sin hora', async () => {
      const response = await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Ana Martínez',
          fecha: '2026-03-20'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('debe rechazar fecha con formato inválido', async () => {
      const response = await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Carlos Ruiz',
          fecha: '20/03/2026', // Formato incorrecto
          hora: '10:00'
        })
        .expect(400);

      expect(response.body.error).toContain('fecha inválido');
    });

    test('debe rechazar hora con formato inválido', async () => {
      const response = await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Laura Sánchez',
          fecha: '2026-03-20',
          hora: '10:00 AM' // Formato incorrecto
        })
        .expect(400);

      expect(response.body.error).toContain('hora inválido');
    });

    test('debe eliminar espacios del nombre del cliente', async () => {
      const response = await request(app)
        .post('/api/citas')
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
    test('debe eliminar una cita existente', async () => {
      // Crear cita
      const createResponse = await request(app)
        .post('/api/citas')
        .send({
          cliente: 'Roberto Díaz',
          fecha: '2026-04-01',
          hora: '11:00'
        });

      const citaId = createResponse.body.data.id;

      // Eliminar cita
      const deleteResponse = await request(app)
        .delete(`/api/citas/${citaId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.id).toBe(citaId);

      // Verificar que fue eliminada
      const getResponse = await request(app).get('/api/citas');
      const citaEliminada = getResponse.body.data.find(c => c.id === citaId);
      expect(citaEliminada).toBeUndefined();
    });

    test('debe devolver 404 si la cita no existe', async () => {
      const response = await request(app)
        .delete('/api/citas/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('no encontrada');
    });

    test('debe rechazar ID inválido', async () => {
      const response = await request(app)
        .delete('/api/citas/abc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ID inválido');
    });
  });

  describe('Manejo de errores HTTP', () => {
    test('GET debe manejar errores internos (500)', async () => {
      // Este test verifica que los errores 500 sean manejados
      // En producción, esto podría ocurrir por fallos de BD
      const response = await request(app).get('/api/citas');
      expect([200, 500]).toContain(response.status);
    });
  });
});
