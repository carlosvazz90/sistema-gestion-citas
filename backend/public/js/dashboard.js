document.addEventListener('DOMContentLoaded', async function() {
  const AUTH_STORAGE_KEY = 'authSession';
  const userEmail = document.getElementById('userEmail');
  const userId = document.getElementById('userId');
  const userRole = document.getElementById('userRole');
  const displayRole = document.getElementById('displayRole');
  const logoutBtn = document.getElementById('logoutBtn');
  const authError = document.getElementById('authError');

  function leerSesion() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function limpiarSesion() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function redirigirLogin() {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1200);
  }

  // Recuperar sesión guardada
  const authSession = leerSesion();
  if (!authSession || !authSession.token) {
    authError.textContent = 'No tienes permisos para acceder a esta página';
    authError.style.display = 'block';
    redirigirLogin();
    return;
  }

  try {
    // Recuperar sesión válida tras recarga o pérdida de conexión temporal
    const response = await fetch('/api/auth/recover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: authSession.token })
    });

    if (!response.ok) {
      if (response.status === 401) {
        limpiarSesion();
        redirigirLogin();
        return;
      }
      throw new Error('Error al verificar sesión');
    }

    const data = await response.json();
    const usuario = data.usuario;

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: data.token,
      sessionId: data.sessionId,
      userId: usuario.id,
      role: usuario.role,
      expiresAt: data.expiresAt,
      updatedAt: Date.now()
    }));

    // Mostrar información del usuario
    userEmail.textContent = usuario.email;
    userId.textContent = usuario.id;
    userRole.textContent = usuario.role.toUpperCase();
    displayRole.textContent = usuario.role;
    document.getElementById('userName').textContent = `Usuario: ${usuario.email}`;

  } catch (error) {
    authError.textContent = 'Error al verificar sesión';
    authError.style.display = 'block';
    limpiarSesion();
    redirigirLogin();
  }

  window.addEventListener('storage', function(event) {
    if (event.key === AUTH_STORAGE_KEY && !event.newValue) {
      window.location.href = '/login';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async function() {
    const sesionActual = leerSesion();
    const token = sesionActual?.token;

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      limpiarSesion();
      window.location.href = '/';
    }
  });
});
