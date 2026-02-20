// Aplicación principal con comunicación asíncrona accesible

/**
 * Estados del formulario:
 * - idle: Esperando entrada
 * - validating: Validación en proceso
 * - valid: Datos correctos
 * - invalid: Datos incorrectos
 * - submitting: Enviando datos
 * - success: Envío exitoso
 * - error: Error en envío
 */

/**
 * Manejo de errores de red:
 * - NetworkError: Sin conexión a internet
 * - 400: Datos inválidos enviados
 * - 404: Recurso no encontrado
 * - 500: Error interno del servidor
 * - Timeout: Petición tarda más de 10 segundos
 */

const API_BASE = '/api';
const TIMEOUT_MS = 10000;

document.addEventListener('DOMContentLoaded', async () => {
  const lista = new ListaCitas('lista-citas');
  let estadoFormulario = 'idle';

  // Cargar citas existentes
  await cargarCitas();

  // Formulario de agregar cita
  const form = document.getElementById('form-cita');
  const btnSubmit = document.getElementById('btn-agregar-cita');
  
  if (form) {
    // Validación en tiempo real
    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', () => validarCampo(input));
      input.addEventListener('input', () => {
        // Limpiar error al escribir
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const cliente = document.getElementById('cliente');
      const fecha = document.getElementById('fecha');
      const hora = document.getElementById('hora');

      // Validar todos los campos
      const camposValidos = [cliente, fecha, hora].every(validarCampo);
      
      if (!camposValidos) {
        anunciar('Por favor completa todos los campos correctamente', 'error');
        return;
      }

      // Estado: submitting
      setEstadoFormulario('submitting');

      try {
        const response = await fetchConTimeout(`${API_BASE}/citas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cliente: cliente.value,
            fecha: fecha.value,
            hora: hora.value
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al crear cita');
        }

        // Agregar cita al DOM
        lista.agregar(data.data);
        form.reset();
        
        // Estado: success
        setEstadoFormulario('success');
        anunciar(data.message || 'Cita creada exitosamente', 'success');
        
        // Volver a idle después de 2 segundos
        setTimeout(() => {
          setEstadoFormulario('idle');
          cliente.focus();
        }, 2000);

      } catch (error) {
        setEstadoFormulario('error');
        manejarError(error, 'crear cita');
        
        // Volver a idle después de 3 segundos
        setTimeout(() => {
          setEstadoFormulario('idle');
        }, 3000);
      }
    });
  }

  /**
   * Cargar citas desde la API
   * Manejo de errores: Muestra mensaje si falla la carga inicial
   */
  async function cargarCitas() {
    try {
      setEstadoCarga(true);
      
      const response = await fetchConTimeout(`${API_BASE}/citas`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar citas');
      }

      // Cargar citas en el DOM
      data.data.forEach(cita => lista.agregar(cita));
      
      setEstadoCarga(false);
      
      if (data.data.length === 0) {
        anunciar('No hay citas registradas', 'info');
      } else {
        anunciar(`${data.data.length} cita(s) cargada(s)`, 'info');
      }

    } catch (error) {
      setEstadoCarga(false);
      manejarError(error, 'cargar citas');
    }
  }

  /**
   * Fetch con timeout para evitar esperas infinitas
   * Manejo de errores: Timeout después de TIMEOUT_MS
   */
  function fetchConTimeout(url, options = {}) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La petición tardó demasiado')), TIMEOUT_MS)
      )
    ]);
  }

  /**
   * Manejo centralizado de errores con mensajes específicos
   * Errores manejados:
   * - TypeError: Sin conexión a internet
   * - Timeout: Petición lenta
   * - HTTP 400, 404, 500: Errores del servidor
   */
  function manejarError(error, accion) {
    let mensaje = '';
    
    // Error de red (sin conexión)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      mensaje = `Sin conexión a internet. No se pudo ${accion}.`;
    }
    // Timeout
    else if (error.message.includes('Timeout')) {
      mensaje = `La conexión es muy lenta. Intenta ${accion} nuevamente.`;
    }
    // Error del servidor
    else {
      mensaje = `Error al ${accion}: ${error.message}`;
    }
    
    anunciar(mensaje, 'error');
    console.error(`[Error ${accion}]:`, error);
  }

  /**
   * Establecer estado de carga global
   */
  function setEstadoCarga(cargando) {
    const main = document.querySelector('main');
    if (main) {
      if (cargando) {
        main.setAttribute('aria-busy', 'true');
        anunciar('Cargando citas...', 'info');
      } else {
        main.removeAttribute('aria-busy');
      }
    }
  }

  function validarCampo(campo) {
    if (!campo.value.trim()) {
      campo.classList.add('error');
      campo.setAttribute('aria-invalid', 'true');
      campo.setAttribute('aria-describedby', `${campo.id}-error`);
      
      // Crear mensaje de error si no existe
      let errorMsg = document.getElementById(`${campo.id}-error`);
      if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.id = `${campo.id}-error`;
        errorMsg.className = 'error-message';
        errorMsg.setAttribute('role', 'alert');
        errorMsg.textContent = 'Este campo es obligatorio';
        campo.parentElement.appendChild(errorMsg);
      }
      
      return false;
    } else {
      campo.classList.remove('error');
      campo.removeAttribute('aria-invalid');
      const errorMsg = document.getElementById(`${campo.id}-error`);
      if (errorMsg) errorMsg.remove();
      return true;
    }
  }

  function setEstadoFormulario(estado) {
    estadoFormulario = estado;
    
    if (!btnSubmit) return;
    
    switch(estado) {
      case 'submitting':
        btnSubmit.disabled = true;
        btnSubmit.setAttribute('aria-busy', 'true');
        btnSubmit.textContent = 'Agregando...';
        btnSubmit.classList.add('loading');
        break;
      case 'success':
        btnSubmit.classList.remove('loading');
        btnSubmit.classList.add('success');
        btnSubmit.textContent = '✓ Agregado';
        break;
      case 'error':
        btnSubmit.disabled = false;
        btnSubmit.removeAttribute('aria-busy');
        btnSubmit.classList.remove('loading');
        btnSubmit.classList.add('error');
        btnSubmit.textContent = '✗ Error';
        break;
      case 'idle':
      default:
        btnSubmit.disabled = false;
        btnSubmit.removeAttribute('aria-busy');
        btnSubmit.classList.remove('loading', 'success', 'error');
        btnSubmit.textContent = 'Agregar Cita';
    }
  }

  function anunciar(mensaje, tipo = 'info') {
    const anuncio = document.getElementById('aria-live-region');
    if (anuncio) {
      anuncio.className = `status-${tipo}`;
      anuncio.textContent = mensaje;
      setTimeout(() => {
        anuncio.textContent = '';
        anuncio.className = '';
      }, 3000);
    }
  }

  // Navegación por teclado en menú
  const menuLinks = document.querySelectorAll('nav a');
  menuLinks.forEach((link, index, all) => {
    // Enter activa el link
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        link.click();
      }
      // Flecha derecha: siguiente
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (all[index + 1]) all[index + 1].focus();
      }
      // Flecha izquierda: anterior
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (all[index - 1]) all[index - 1].focus();
      }
    });
  });

  // Atajo de teclado: Ctrl+N para nuevo
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      const primerCampo = document.getElementById('cliente');
      if (primerCampo) primerCampo.focus();
    }
  });
});
