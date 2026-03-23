document.addEventListener('DOMContentLoaded', function() {
  const AUTH_STORAGE_KEY = 'authSession';
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const statusMessage = document.getElementById('statusMessage');
  const loading = document.getElementById('loading');

  // Validación accesible
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function mostrarError(input, mensaje) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    const errorId = input.id + 'Error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = mensaje;
    }
  }

  function limpiarError(input) {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    const errorId = input.id + 'Error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  // Validación en tiempo real
  emailInput.addEventListener('blur', function() {
    if (this.value.trim() === '') {
      mostrarError(this, 'El email es requerido');
    } else if (!validarEmail(this.value)) {
      mostrarError(this, 'Ingresa un email válido');
    } else {
      limpiarError(this);
    }
  });

  emailInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      if (this.value.trim() !== '' && validarEmail(this.value)) {
        limpiarError(this);
      }
    }
  });

  passwordInput.addEventListener('blur', function() {
    if (this.value.trim() === '') {
      mostrarError(this, 'La contraseña es requerida');
    } else if (this.value.length < 6) {
      mostrarError(this, 'La contraseña debe tener al menos 6 caracteres');
    } else {
      limpiarError(this);
    }
  });

  passwordInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      if (this.value.length >= 6) {
        limpiarError(this);
      }
    }
  });

  // Envío de formulario
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validación previa
    let esValido = true;

    if (email === '') {
      mostrarError(emailInput, 'El email es requerido');
      esValido = false;
    } else if (!validarEmail(email)) {
      mostrarError(emailInput, 'Ingresa un email válido');
      esValido = false;
    } else {
      limpiarError(emailInput);
    }

    if (password === '') {
      mostrarError(passwordInput, 'La contraseña es requerida');
      esValido = false;
    } else if (password.length < 6) {
      mostrarError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
      esValido = false;
    } else {
      limpiarError(passwordInput);
    }

    if (!esValido) {
      statusMessage.className = 'alert alert-error';
      statusMessage.textContent = 'Por favor, revisa los campos';
      statusMessage.setAttribute('role', 'alert');
      return;
    }

    // Desabilitar botón y mostrar carga
    loginBtn.disabled = true;
    loading.style.display = 'block';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        statusMessage.className = 'alert alert-success';
        statusMessage.textContent = 'Login exitoso. Redirigiendo...';
        statusMessage.setAttribute('role', 'status');
        
        // Guardar sesión en una sola estructura para evitar estados inconsistentes
        const authSession = {
          token: data.token,
          sessionId: data.sessionId,
          userId: data.userId,
          role: data.role,
          expiresAt: data.expiresAt,
          updatedAt: Date.now()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } else {
        // Error sin filtrar información sensible
        statusMessage.className = 'alert alert-error';
        statusMessage.textContent = 'Email o contraseña inválidos';
        statusMessage.setAttribute('role', 'alert');
        passwordInput.value = '';
        passwordInput.focus();
      }
    } catch (error) {
      statusMessage.className = 'alert alert-error';
      statusMessage.textContent = 'Error al conectar con el servidor. Intenta de nuevo.';
      statusMessage.setAttribute('role', 'alert');
    } finally {
      loginBtn.disabled = false;
      loading.style.display = 'none';
    }
  });

  // Enfocar en el primer campo al cargar
  emailInput.focus();
});
