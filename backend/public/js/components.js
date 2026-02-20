// Componentes dinámicos accesibles con estados y eventos

/**
 * Estados posibles de un botón:
 * - normal: Estado por defecto
 * - hover: Mouse sobre el elemento
 * - focus: Elemento enfocado por teclado
 * - loading: Acción en proceso
 * - disabled: Botón deshabilitado
 * - error: Acción falló
 * - success: Acción exitosa
 */

class CitaCard {
  constructor(data) {
    this.data = data;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'cita-card';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Cita con ${this.data.cliente}`);
    card.dataset.citaId = this.data.id;
    
    card.innerHTML = `
      <h3 tabindex="0">${this.data.cliente}</h3>
      <p><strong>Fecha:</strong> ${this.data.fecha}</p>
      <p><strong>Hora:</strong> ${this.data.hora}</p>
      <button 
        class="btn-eliminar" 
        data-id="${this.data.id}" 
        aria-label="Eliminar cita de ${this.data.cliente}"
        type="button">
        <span class="btn-text">Eliminar</span>
        <span class="btn-spinner" aria-hidden="true" style="display:none;">⏳</span>
      </button>
    `;
    
    return card;
  }
}

class ListaCitas {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.citas = [];
    this.estados = {}; // Guardar estado de cada botón
  }

  agregar(cita) {
    // Evitar duplicados (en caso de recarga desde API)
    const existe = this.citas.find(c => c.id === cita.id);
    if (existe) return;
    
    this.citas.push(cita);
    this.estados[cita.id] = 'normal';
    this.actualizar();
    
    // Anunciar a lectores de pantalla
    this.anunciar(`Cita agregada para ${cita.cliente}`, 'success');
    
    // Mover foco al nuevo elemento
    setTimeout(() => {
      const nuevaCita = this.container.querySelector(`[data-cita-id="${cita.id}"]`);
      if (nuevaCita) {
        nuevaCita.querySelector('h3').focus();
      }
    }, 100);
  }

  /**
   * Eliminar cita usando API REST
   * Manejo de errores: Muestra mensaje si falla la eliminación
   */
  async eliminar(id) {
    const cita = this.citas.find(c => c.id === id);
    
    // Estado: loading
    this.setEstadoBoton(id, 'loading');
    
    try {
      const response = await fetch(`/api/citas/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar cita');
      }

      // Eliminar del DOM
      this.citas = this.citas.filter(c => c.id !== id);
      delete this.estados[id];
      this.actualizar();
      
      this.anunciar(data.message || `Cita de ${cita.cliente} eliminada`, 'success');
      
      // Devolver foco al botón de agregar
      const btnAgregar = document.getElementById('btn-agregar-cita');
      if (btnAgregar) {
        btnAgregar.focus();
      }

    } catch (error) {
      // Manejar error
      this.setEstadoBoton(id, 'error');
      
      let mensaje = '';
      if (error instanceof TypeError) {
        mensaje = 'Sin conexión. No se pudo eliminar la cita.';
      } else {
        mensaje = `Error al eliminar: ${error.message}`;
      }
      
      this.anunciar(mensaje, 'error');
      console.error('[Error eliminar]:', error);
      
      // Volver a estado normal después de 3 segundos
      setTimeout(() => {
        this.setEstadoBoton(id, 'normal');
      }, 3000);
    }
  }

  setEstadoBoton(citaId, estado) {
    this.estados[citaId] = estado;
    const card = this.container.querySelector(`[data-cita-id="${citaId}"]`);
    if (!card) return;
    
    const btn = card.querySelector('.btn-eliminar');
    const spinner = card.querySelector('.btn-spinner');
    const texto = card.querySelector('.btn-text');
    
    // Actualizar atributos ARIA según estado
    switch(estado) {
      case 'loading':
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('loading');
        if (spinner) spinner.style.display = 'inline';
        if (texto) texto.textContent = 'Eliminando...';
        break;
      case 'disabled':
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('disabled');
        break;
      case 'error':
        btn.classList.add('error');
        btn.setAttribute('aria-label', 'Error al eliminar');
        break;
      case 'normal':
      default:
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('loading', 'disabled', 'error');
        if (spinner) spinner.style.display = 'none';
        if (texto) texto.textContent = 'Eliminar';
    }
  }

  actualizar() {
    // Limpiar contenedor sin romper accesibilidad
    this.container.innerHTML = '';
    
    if (this.citas.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'No hay citas agendadas';
      mensaje.setAttribute('role', 'status');
      this.container.appendChild(mensaje);
      return;
    }

    // Renderizar todas las citas
    this.citas.forEach(cita => {
      const card = new CitaCard(cita);
      this.container.appendChild(card.render());
    });

    // Agregar listeners a botones de eliminar
    this.agregarEventListeners();
  }

  agregarEventListeners() {
    this.container.querySelectorAll('.btn-eliminar').forEach(btn => {
      // Evento mouse
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.closest('button').dataset.id);
        this.eliminar(id);
      });

      // Evento teclado: Enter y Space
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = parseInt(e.target.dataset.id);
          this.eliminar(id);
        }
      });
    });

    // Navegación con flechas en las tarjetas
    this.container.querySelectorAll('.cita-card h3').forEach((h3, index, all) => {
      h3.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (all[index + 1]) all[index + 1].focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (all[index - 1]) all[index - 1].focus();
        }
      });
    });
  }

  anunciar(mensaje, tipo = 'info') {
    const anuncio = document.getElementById('aria-live-region');
    if (anuncio) {
      // Limpiar clase anterior
      anuncio.className = '';
      anuncio.classList.add(`status-${tipo}`);
      anuncio.textContent = mensaje;
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        anuncio.textContent = '';
        anuncio.className = '';
      }, 3000);
    }
  }
}

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CitaCard, ListaCitas };
}
