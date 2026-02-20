/**
 * @jest-environment jsdom
 */

const { CitaCard, ListaCitas } = require('../public/js/components');

// Mock de fetch para jsdom
global.fetch = jest.fn();

describe('CitaCard', () => {
  test('debe renderizar una tarjeta de cita con datos correctos', () => {
    const data = {
      id: 1,
      cliente: 'Juan Pérez',
      fecha: '2026-02-20',
      hora: '10:00'
    };

    const card = new CitaCard(data);
    const elemento = card.render();

    expect(elemento.className).toBe('cita-card');
    expect(elemento.getAttribute('role')).toBe('article');
    expect(elemento.textContent).toContain('Juan Pérez');
    expect(elemento.textContent).toContain('2026-02-20');
    expect(elemento.textContent).toContain('10:00');
  });

  test('debe tener atributos ARIA correctos', () => {
    const data = {
      id: 1,
      cliente: 'María López',
      fecha: '2026-02-21',
      hora: '15:30'
    };

    const card = new CitaCard(data);
    const elemento = card.render();

    expect(elemento.getAttribute('aria-label')).toBe('Cita con María López');
    
    const boton = elemento.querySelector('.btn-eliminar');
    expect(boton.getAttribute('aria-label')).toContain('María López');
  });

  test('debe incluir botón de eliminar con data-id', () => {
    const data = {
id: 5,
      cliente: 'Test',
      fecha: '2026-02-22',
      hora: '09:00'
    };

    const card = new CitaCard(data);
    const elemento = card.render();
    const boton = elemento.querySelector('.btn-eliminar');

    expect(boton).toBeTruthy();
    expect(boton.dataset.id).toBe('5');
  });
});

describe('ListaCitas', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="lista-citas"></div>
      <div id="aria-live-region" role="status" aria-live="polite"></div>
      <button id="btn-agregar-cita">Agregar</button>
    `;
  });

  test('debe agregar una cita a la lista', () => {
    const lista = new ListaCitas('lista-citas');
    const cita = {
      id: 1,
      cliente: 'Ana García',
      fecha: '2026-02-23',
      hora: '11:00'
    };

    lista.agregar(cita);

    expect(lista.citas.length).toBe(1);
    expect(lista.citas[0].cliente).toBe('Ana García');
  });

  test('debe eliminar una cita por ID', async () => {
    // Mock de fetch para DELETE exitoso
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Cita eliminada'
      })
    });
    
    const lista = new ListaCitas('lista-citas');
    lista.agregar({ id: 1, cliente: 'Cliente 1', fecha: '2026-02-20', hora: '10:00' });
    lista.agregar({ id: 2, cliente: 'Cliente 2', fecha: '2026-02-21', hora: '11:00' });

    await lista.eliminar(1);

    expect(lista.citas.length).toBe(1);
    expect(lista.citas[0].id).toBe(2);
    expect(global.fetch).toHaveBeenCalledWith('/api/citas/1', { method: 'DELETE' });
  });

  test('debe mostrar mensaje cuando no hay citas', () => {
    const lista = new ListaCitas('lista-citas');
    lista.actualizar();

    const container = document.getElementById('lista-citas');
    expect(container.textContent).toContain('No hay citas agendadas');
  });

  test('debe renderizar todas las citas', () => {
    const lista = new ListaCitas('lista-citas');
    lista.agregar({ id: 1, cliente: 'Cliente 1', fecha: '2026-02-20', hora: '10:00' });
    lista.agregar({ id: 2, cliente: 'Cliente 2', fecha: '2026-02-21', hora: '11:00' });
    lista.agregar({ id: 3, cliente: 'Cliente 3', fecha: '2026-02-22', hora: '12:00' });

    const container = document.getElementById('lista-citas');
    const cards = container.querySelectorAll('.cita-card');

    expect(cards.length).toBe(3);
  });

  test('debe anunciar cambios en región ARIA live', () => {
    const lista = new ListaCitas('lista-citas');
    const cita = { id: 1, cliente: 'Pedro Ruiz', fecha: '2026-02-24', hora: '14:00' };

    lista.agregar(cita);

    const ariaRegion = document.getElementById('aria-live-region');
    expect(ariaRegion.textContent).toContain('Cita agregada para Pedro Ruiz');
  });
});

describe('Gestión de foco', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="lista-citas"></div>
      <div id="aria-live-region" role="status" aria-live="polite"></div>
      <button id="btn-agregar-cita">Agregar</button>
    `;
  });

  test('debe verificar que elementos tienen tabindex para navegación por teclado', () => {
    const lista = new ListaCitas('lista-citas');
    const cita = { id: 1, cliente: 'Test', fecha: '2026-02-20', hora: '10:00' };
    
    lista.agregar(cita);

    const h3 = document.querySelector('.cita-card h3');
    expect(h3.getAttribute('tabindex')).toBe('0');
  });
});
