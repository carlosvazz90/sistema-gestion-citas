document.addEventListener('DOMContentLoaded', function() {
  const requestForm = document.getElementById('requestForm');
  const validateForm = document.getElementById('validateForm');
  const resetForm = document.getElementById('resetForm');

  const requestEmail = document.getElementById('requestEmail');
  const tokenValidate = document.getElementById('tokenValidate');
  const tokenReset = document.getElementById('tokenReset');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  const statusMessage = document.getElementById('statusMessage');
  const tokenBox = document.getElementById('tokenBox');
  const validateBtn = document.getElementById('validateBtn');
  const resetBtn = document.getElementById('resetBtn');

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function mostrarEstado(tipo, mensaje) {
    statusMessage.className = tipo === 'ok' ? 'alert alert-success' : 'alert alert-error';
    statusMessage.textContent = mensaje;
    statusMessage.setAttribute('role', tipo === 'ok' ? 'status' : 'alert');
  }

  function mostrarError(input, mensaje) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    const error = document.getElementById(input.id + 'Error');
    if (error) {
      error.textContent = mensaje;
    }
  }

  function limpiarError(input) {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    const error = document.getElementById(input.id + 'Error');
    if (error) {
      error.textContent = '';
    }
  }

  requestForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = requestEmail.value.trim();

    if (!email) {
      mostrarError(requestEmail, 'El correo es requerido');
      return;
    }

    if (!validarEmail(email)) {
      mostrarError(requestEmail, 'Ingresa un correo válido');
      return;
    }

    limpiarError(requestEmail);

    try {
      const response = await fetch('/api/auth/password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarEstado('error', data.error || 'No se pudo procesar la solicitud');
        return;
      }

      mostrarEstado('ok', data.message || 'Solicitud procesada');

      if (data.recoveryToken) {
        tokenBox.style.display = 'block';
        tokenBox.textContent = 'Token de prueba (solo entorno académico): ' + data.recoveryToken;
        tokenValidate.value = data.recoveryToken;
        tokenReset.value = data.recoveryToken;
      } else {
        tokenBox.style.display = 'none';
      }
    } catch (error) {
      mostrarEstado('error', 'Error de conexión. Intenta nuevamente.');
    }
  });

  validateForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const token = tokenValidate.value.trim();

    if (!token) {
      mostrarError(tokenValidate, 'El token es requerido');
      return;
    }

    limpiarError(tokenValidate);
    validateBtn.disabled = true;

    try {
      const response = await fetch('/api/auth/password/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarEstado('error', data.error || 'Token inválido o expirado');
        return;
      }

      tokenReset.value = token;
      mostrarEstado('ok', 'Token válido. Ahora puedes cambiar la contraseña.');
      newPassword.focus();
    } catch (error) {
      mostrarEstado('error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      validateBtn.disabled = false;
    }
  });

  resetForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const token = tokenReset.value.trim();
    const pass = newPassword.value;
    const confirm = confirmPassword.value;

    let formValido = true;

    if (!token) {
      mostrarError(tokenReset, 'El token es requerido');
      formValido = false;
    } else {
      limpiarError(tokenReset);
    }

    if (!pass) {
      mostrarError(newPassword, 'La nueva contraseña es requerida');
      formValido = false;
    } else if (pass.length < 6) {
      mostrarError(newPassword, 'Debe tener al menos 6 caracteres');
      formValido = false;
    } else {
      limpiarError(newPassword);
    }

    if (!confirm) {
      mostrarError(confirmPassword, 'Debes confirmar la contraseña');
      formValido = false;
    } else if (confirm !== pass) {
      mostrarError(confirmPassword, 'Las contraseñas no coinciden');
      formValido = false;
    } else {
      limpiarError(confirmPassword);
    }

    if (!formValido) {
      mostrarEstado('error', 'Revisa los campos del formulario');
      return;
    }

    resetBtn.disabled = true;

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          password: pass
        })
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarEstado('error', data.error || 'No se pudo cambiar la contraseña');
        return;
      }

      mostrarEstado('ok', 'Contraseña cambiada con éxito. Ya puedes iniciar sesión.');
      newPassword.value = '';
      confirmPassword.value = '';
    } catch (error) {
      mostrarEstado('error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      resetBtn.disabled = false;
    }
  });

  requestEmail.focus();
});
