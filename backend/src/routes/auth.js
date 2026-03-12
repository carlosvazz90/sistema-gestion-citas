const express = require('express');
const router = express.Router();

// Almacenamiento en memoria para sesiones (en producción usar BD)
const sesiones = {};
let contadorSesion = 1;

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

  const sesion = sesiones[token];
  if (!sesion || Date.now() > sesion.expira) {
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
    const token = `token_${contadorSesion++}_${Date.now()}`;
    const expira = Date.now() + (3600 * 1000); // 1 hora

    sesiones[token] = {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nombre: usuario.nombre
      },
      expira: expira
    };

    res.json({
      success: true,
      token: token,
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
    res.json({
      success: true,
      usuario: req.usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al verificar'
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
