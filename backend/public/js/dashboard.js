document.addEventListener('DOMContentLoaded', async function() {
  const userEmail = document.getElementById('userEmail');
  const userId = document.getElementById('userId');
  const userRole = document.getElementById('userRole');
  const displayRole = document.getElementById('displayRole');
  const logoutBtn = document.getElementById('logoutBtn');
  const authError = document.getElementById('authError');

  // Verificar si hay sesión en localStorage
  const token = localStorage.getItem('token');
  const storedUserId = localStorage.getItem('userId');
  const storedRole = localStorage.getItem('role');

  if (!token || !storedUserId || !storedRole) {
    authError.textContent = 'No tienes permisos para acceder a esta página';
    authError.style.display = 'block';
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }

  try {
    // Verificar sesión con el servidor
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      throw new Error('Error al verificar sesión');
    }

    const data = await response.json();
    const usuario = data.usuario;

    // Mostrar información del usuario
    userEmail.textContent = usuario.email;
    userId.textContent = usuario.id;
    userRole.textContent = usuario.role.toUpperCase();
    displayRole.textContent = usuario.role;
    document.getElementById('userName').textContent = `Usuario: ${usuario.email}`;

  } catch (error) {
    authError.textContent = 'Error al verificar sesión';
    authError.style.display = 'block';
    setTimeout(() => {
      localStorage.clear();
      window.location.href = '/login';
    }, 2000);
  }

  // Logout
  logoutBtn.addEventListener('click', async function() {
    const token = localStorage.getItem('token');

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
      localStorage.clear();
      window.location.href = '/';
    }
  });
});
