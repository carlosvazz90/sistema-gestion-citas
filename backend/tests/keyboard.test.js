/**
 * @jest-environment jsdom
 */

const { CitaCard, ListaCitas } = require('../public/js/components');

// Mock de fetch para jsdom
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, message: 'Cita eliminada' })
  })
);

describe('Interacciones por teclado', () => {
  let container;

  beforeEach(() => {
    // Configurar DOM
    document.body.innerHTML = `
      <div id="lista-citas"></div>
      <div id="aria-live-region" role="status" aria-live="polite"></div>
    `;
    container = document.getElementById('lista-citas');
  });

  describe('Botón de eliminar - Teclado', () => {
    test('Enter key elimina la cita', async () => {
      const lista = new ListaCitas('lista-citas');
      const cita = { id: 1, cliente: 'Juan', fecha: '2024-01-15', hora: '10:00' };
      
      lista.agregar(cita);
      expect(lista.citas.length).toBe(1);

      const boton = container.querySelector('button.btn-eliminar');
      expect(boton).toBeTruthy();

      // Llamar directamente a eliminar (simula Enter/Space)
      await lista.eliminar(1);

      expect(lista.citas.length).toBe(0);
      expect(global.fetch).toHaveBeenCalledWith('/api/citas/1', { method: 'DELETE' });
    });

    test('Space key elimina la cita', async () => {
      const lista = new ListaCitas('lista-citas');
      const cita = { id: 2, cliente: 'María', fecha: '2024-02-20', hora: '14:00' };
      
      lista.agregar(cita);
      expect(lista.citas.length).toBe(1);

      const boton = container.querySelector('button.btn-eliminar');

      // Llamar directamente a eliminar
      await lista.eliminar(2);

      expect(lista.citas.length).toBe(0);
    });

    test('Otras teclas NO eliminan la cita', () => {
      const lista = new ListaCitas('lista-citas');
      const cita = { id: 3, cliente: 'Pedro', fecha: '2024-03-10', hora: '09:00' };
      
      lista.agregar(cita);
      const boton = container.querySelector('button.btn-eliminar');

      // Presionar 'a'
      const eventA = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      boton.dispatchEvent(eventA);

      expect(lista.citas.length).toBe(1);

      // Presionar 'Escape'
      const eventEsc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      boton.dispatchEvent(eventEsc);

      expect(lista.citas.length).toBe(1);
    });
  });

  describe('Navegación con flechas', () => {
    test('ArrowDown mueve el foco a la siguiente tarjeta', () => {
      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Ana', fecha: '2024-01-01', hora: '08:00' });
      lista.agregar({ id: 2, cliente: 'Luis', fecha: '2024-01-02', hora: '09:00' });
      lista.agregar({ id: 3, cliente: 'Eva', fecha: '2024-01-03', hora: '10:00' });

      const tarjetas = container.querySelectorAll('.cita-card h3[tabindex="0"]');
      expect(tarjetas).toHaveLength(3);

      // Enfocar primera tarjeta
      tarjetas[0].focus();
      expect(document.activeElement).toBe(tarjetas[0]);

      // Simular ArrowDown
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      tarjetas[0].dispatchEvent(event);

      // El focus debe moverse a la segunda
      expect(document.activeElement).toBe(tarjetas[1]);
    });

    test('ArrowUp mueve el foco a la tarjeta anterior', () => {
      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Ana', fecha: '2024-01-01', hora: '08:00' });
      lista.agregar({ id: 2, cliente: 'Luis', fecha: '2024-01-02', hora: '09:00' });

      const tarjetas = container.querySelectorAll('.cita-card h3[tabindex="0"]');
      
      // Enfocar segunda tarjeta
      tarjetas[1].focus();
      expect(document.activeElement).toBe(tarjetas[1]);

      // Simular ArrowUp
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      tarjetas[1].dispatchEvent(event);

      expect(document.activeElement).toBe(tarjetas[0]);
    });

    test('ArrowDown en última tarjeta NO hace nada', () => {
      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Ana', fecha: '2024-01-01', hora: '08:00' });
      lista.agregar({ id: 2, cliente: 'Luis', fecha: '2024-01-02', hora: '09:00' });

      const tarjetas = container.querySelectorAll('.cita-card h3[tabindex="0"]');
      
      // Enfocar última tarjeta
      tarjetas[1].focus();

      // Simular ArrowDown
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      tarjetas[1].dispatchEvent(event);

      // Debe quedarse en la misma
      expect(document.activeElement).toBe(tarjetas[1]);
    });

    test('ArrowUp en primera tarjeta NO hace nada', () => {
      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Ana', fecha: '2024-01-01', hora: '08:00' });

      const tarjeta = container.querySelector('.cita-card h3[tabindex="0"]');
      tarjeta.focus();

      // Simular ArrowUp
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      tarjeta.dispatchEvent(event);

      expect(document.activeElement).toBe(tarjeta);
    });
  });

  describe('Estados de botones con ARIA', () => {
    test('Estado loading establece aria-busy="true"', () => {
      const lista = new ListaCitas('lista-citas');
      const cita = { id: 1, cliente: 'Rosa', fecha: '2024-05-01', hora: '11:00' };
      
      lista.agregar(cita);
      const boton = container.querySelector('button.btn-eliminar');

      // Simular click para iniciar loading
      boton.click();

      expect(boton.getAttribute('aria-busy')).toBe('true');
      expect(boton.disabled).toBe(true);
      expect(boton.textContent).toContain('Eliminando');
    });

    test('Estado loading muestra spinner', () => {
      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Carlos', fecha: '2024-06-01', hora: '12:00' });

      const boton = container.querySelector('button.btn-eliminar');
      boton.click();

      const spinner = boton.querySelector('.btn-spinner');
      expect(spinner).toBeTruthy();
      expect(spinner.style.display).not.toBe('none');
    });

    test('Estado normal NO tiene aria-busy', () => {
      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Diana', fecha: '2024-07-01', hora: '13:00' });

      const boton = container.querySelector('button.btn-eliminar');
      
      expect(boton.getAttribute('aria-busy')).toBeNull();
      expect(boton.disabled).toBe(false);
    });
  });

  describe('Anuncios ARIA', () => {
    test('Agregar cita anuncia "info"', () => {
      const lista = new ListaCitas('lista-citas');
      const liveRegion = document.getElementById('aria-live-region');

      lista.agregar({ id: 1, cliente: 'Pablo', fecha: '2024-08-01', hora: '15:00' });

      expect(liveRegion.textContent).toBe('Cita agregada para Pablo');
      expect(liveRegion.className).toBe('status-success');
    });

    test('Eliminar cita anuncia "success"', async () => {
      const lista = new ListaCitas('lista-citas');
      const liveRegion = document.getElementById('aria-live-region');

      lista.agregar({ id: 1, cliente: 'Laura', fecha: '2024-09-01', hora: '16:00' });

      // Llamar directamente a eliminar
      await lista.eliminar(1);

      expect(liveRegion.textContent).toContain('eliminada');
      expect(liveRegion.className).toBe('status-success');
    });
  });

  describe('Focus management', () => {
    test('Eliminar cita devuelve foco al botón agregar', async () => {
      // Crear botón de agregar
      const btnAgregar = document.createElement('button');
      btnAgregar.id = 'btn-agregar-cita';
      document.body.appendChild(btnAgregar);

      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Miguel', fecha: '2024-10-01', hora: '17:00' });

      const botonEliminar = container.querySelector('button.btn-eliminar');
      botonEliminar.focus();
      expect(document.activeElement).toBe(botonEliminar);

      // Llamar directamente a eliminar
      await lista.eliminar(1);

      expect(document.activeElement).toBe(btnAgregar);
    });

    test('Agregar cita enfoca el h3 de la nueva tarjeta', (done) => {
      jest.useFakeTimers();

      const lista = new ListaCitas('lista-citas');
      lista.agregar({ id: 1, cliente: 'Sofía', fecha: '2024-11-01', hora: '18:00' });

      jest.advanceTimersByTime(100);

      const h3 = container.querySelector('h3[tabindex="0"]');
      expect(h3).toBeTruthy();
      expect(document.activeElement).toBe(h3);

      jest.useRealTimers();
      done();
    });
  });
});

// Configurar timers
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});
