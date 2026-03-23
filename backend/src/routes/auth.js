const express = require('express');
const router = express.Router();

// Almacenamiento en memoria para sesiones (en producción usar BD)
const sesiones = {};
let contadorSesion = 1;

const DURACION_SESION_MS = 3600 * 1000; // 1 hora

function limpiarSesionesExpiradas() {
  const ahora = Date.now();
  Object.keys(sesiones).forEach((token) => {
    if (ahora > sesiones[token].expira) {
      delete sesiones[token];
    }
  });
}

function obtenerSesionValida(token) {
  if (!token) {
    return null;
  }

  limpiarSesionesExpiradas();
  const sesion = sesiones[token];

  if (!sesion) {
    return null;
  }

  sesion.ultimaActividad = Date.now();
  return sesion;
}

function eliminarSesionesUsuario(usuarioId) {
  let eliminadas = 0;

  Object.keys(sesiones).forEach((token) => {
    if (sesiones[token].usuario.id === usuarioId) {
      delete sesiones[token];
      eliminadas += 1;
    }
  });

  return eliminadas;
}

// Base de datos simulada de usuarios
const usuarios = [
  {
    id: 1,
    email: 'admin@ejemplo.com',
    password: 'admin123',
    role: 'admin',
    nombre: 'Admin'
  },
  {
    id: 2,
    email: 'usuario@ejemplo.com',
    password: 'usuario123',
    role: 'usuario',
    nombre: 'Usuario'
  }
];

// Middleware de autenticación
const verificarAutenticacion = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }

  const sesion = obtenerSesionValida(token);
  if (!sesion) {
    delete sesiones[token];
    return res.status(401).json({
      success: false,
      error: 'Sesión expirada'
    });
  }

  req.usuario = sesion.usuario;
  req.token = token;
  next();
};

// Middleware de autorización por rol
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos'
      });
    }
    next();
  };
};

// POST /api/auth/login
router.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña requeridos'
      });
    }

    // Buscar usuario
    const usuario = usuarios.find(u => u.email === email);

    // Por seguridad, no indicar si el email existe o no
    if (!usuario || usuario.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Email o contraseña inválidos'
      });
    }

    // Crear token y sesión
    const sessionId = contadorSesion++;
    const token = `token_${sessionId}_${Date.now()}`;
    const ahora = Date.now();
    const expira = ahora + DURACION_SESION_MS;

    sesiones[token] = {
      id: sessionId,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nombre: usuario.nombre
      },
      expira: expira,
      creadaEn: ahora,
      ultimaActividad: ahora
    };

    res.json({
      success: true,
      token: token,
      sessionId: sesiones[token].id,
      expiresAt: expira,
      userId: usuario.id,
      role: usuario.role,
      message: `Bienvenido ${usuario.nombre}`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al procesar login'
    });
  }
});

// POST /api/auth/logout
router.post('/api/auth/logout', verificarAutenticacion, (req, res) => {
  try {
    const cerrarTodas = req.query.all === 'true';

    if (cerrarTodas) {
      const total = eliminarSesionesUsuario(req.usuario.id);
      return res.json({
        success: true,
        message: 'Todas las sesiones cerradas',
        sesionesCerradas: total
      });
    }

    delete sesiones[req.token];
    res.json({
      success: true,
      message: 'Sesión cerrada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión'
    });
  }
});

// GET /api/auth/verify
router.get('/api/auth/verify', verificarAutenticacion, (req, res) => {
  try {
    const sesion = sesiones[req.token];
    res.json({
      success: true,
      usuario: req.usuario,
      sessionId: sesion.id,
      expiresAt: sesion.expira
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al verificar'
    });
  }
});

// POST /api/auth/recover
router.post('/api/auth/recover', (req, res) => {
  try {
    const { token } = req.body;
    const sesion = obtenerSesionValida(token);

    if (!sesion) {
      if (token) {
        delete sesiones[token];
      }

      return res.status(401).json({
        success: false,
        error: 'Sesión inválida o expirada'
      });
    }

    return res.json({
      success: true,
      token,
      sessionId: sesion.id,
      expiresAt: sesion.expira,
      usuario: sesion.usuario
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al recuperar sesión'
    });
  }
});

// GET /api/citas (protegido)
router.get('/api/citas/protegido', verificarAutenticacion, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Acceso a citas protegido',
      usuario: req.usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error'
    });
  }
});

// Exportar middlewares
router.verificarAutenticacion = verificarAutenticacion;
router.verificarRol = verificarRol;

module.exports = router;
