const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const COOKIE_NAME = 'sessionToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  path: '/'
};

// Almacenamiento en memoria para sesiones (en producción usar BD)
const sesiones = {};
let contadorSesion = 1;

const DURACION_SESION_MS = 3600 * 1000; // 1 hora
const DURACION_TOKEN_RECUPERACION_MS = 15 * 60 * 1000; // 15 minutos

// Tokens de recuperación en memoria (en producción usar BD)
const tokensRecuperacion = {};

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

function limpiarTokensRecuperacionExpirados() {
  const ahora = Date.now();
  Object.keys(tokensRecuperacion).forEach((tokenHash) => {
    const tokenInfo = tokensRecuperacion[tokenHash];
    if (tokenInfo.usado || ahora > tokenInfo.expira) {
      delete tokensRecuperacion[tokenHash];
    }
  });
}

function generarTokenSeguro() {
  return crypto.randomBytes(32).toString('hex');
}

function generarHashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function crearTokenRecuperacion(usuarioId) {
  // Invalidar tokens anteriores del usuario para reducir superficie de ataque
  Object.keys(tokensRecuperacion).forEach((tokenHash) => {
    if (tokensRecuperacion[tokenHash].usuarioId === usuarioId) {
      delete tokensRecuperacion[tokenHash];
    }
  });

  const token = generarTokenSeguro();
  const tokenHash = generarHashToken(token);
  const ahora = Date.now();

  tokensRecuperacion[tokenHash] = {
    usuarioId,
    creadoEn: ahora,
    expira: ahora + DURACION_TOKEN_RECUPERACION_MS,
    usado: false
  };

  return token;
}

function obtenerTokenRecuperacionValido(tokenPlano) {
  if (!tokenPlano) {
    return null;
  }

  limpiarTokensRecuperacionExpirados();
  const tokenHash = generarHashToken(tokenPlano);
  const tokenInfo = tokensRecuperacion[tokenHash];

  if (!tokenInfo || tokenInfo.usado || Date.now() > tokenInfo.expira) {
    return null;
  }

  return {
    tokenHash,
    ...tokenInfo
  };
}

function obtenerCookies(req) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce((cookies, pair) => {
    const [rawName, ...rawValue] = pair.trim().split('=');
    cookies[rawName] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
}

function obtenerTokenRequest(req) {
  const headerToken = req.headers.authorization?.replace('Bearer ', '').trim();

  if (headerToken) {
    return headerToken;
  }

  const cookies = obtenerCookies(req);
  return cookies[COOKIE_NAME] || null;
}

function guardarCookieSesion(res, token, expira) {
  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    expires: new Date(expira)
  });
}

function limpiarCookieSesion(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

function responderBloqueoWeb(res, statusCode, mensaje) {
  const titulo = statusCode === 401 ? 'Acceso restringido' : 'Acceso denegado';
  const accion = statusCode === 401
    ? '<a href="/login">Iniciar sesión</a>'
    : '<a href="/dashboard">Volver al dashboard</a>';

  return res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titulo}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; color: #333; margin: 0; }
        main { max-width: 640px; margin: 60px auto; background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
        h1 { color: #d32f2f; margin-bottom: 12px; }
        p { line-height: 1.5; }
        a { display: inline-block; margin-top: 16px; color: #fff; background: #1976d2; padding: 10px 18px; border-radius: 4px; text-decoration: none; }
      </style>
    </head>
    <body>
      <main role="main">
        <h1>${titulo}</h1>
        <p>${mensaje}</p>
        ${accion}
      </main>
    </body>
    </html>
  `);
}

function autenticarRequest(req) {
  const token = obtenerTokenRequest(req);
  const sesion = obtenerSesionValida(token);

  if (!sesion) {
    if (token) {
      delete sesiones[token];
    }

    return null;
  }

  req.usuario = sesion.usuario;
  req.token = token;
  req.sesion = sesion;
  return sesion;
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
  const token = obtenerTokenRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }

  const sesion = autenticarRequest(req);

  if (!sesion) {
    return res.status(401).json({
      success: false,
      error: 'Sesión expirada'
    });
  }

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

const protegerVista = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const sesion = autenticarRequest(req);

    if (!sesion) {
      return responderBloqueoWeb(res, 401, 'Debes iniciar sesión para acceder a este recurso.');
    }

    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(req.usuario.role)) {
      return responderBloqueoWeb(res, 403, 'Tu rol no tiene permisos para acceder a este recurso.');
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

    guardarCookieSesion(res, token, expira);

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
      limpiarCookieSesion(res);
      return res.json({
        success: true,
        message: 'Todas las sesiones cerradas',
        sesionesCerradas: total
      });
    }

    delete sesiones[req.token];
    limpiarCookieSesion(res);
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

    guardarCookieSesion(res, token, sesion.expira);

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

// POST /api/auth/password/request
router.post('/api/auth/password/request', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    // Respuesta no reveladora: siempre el mismo mensaje
    const mensajeGenerico = 'Si el correo existe, se enviaron instrucciones de recuperación';
    const usuario = usuarios.find((u) => u.email === email);

    if (usuario) {
      const tokenRecuperacion = crearTokenRecuperacion(usuario.id);
      const respuesta = {
        success: true,
        message: mensajeGenerico
      };

      // Solo para evidencia funcional en entorno académico/desarrollo
      if (process.env.NODE_ENV !== 'production') {
        respuesta.recoveryToken = tokenRecuperacion;
        respuesta.expiresInMinutes = 15;
      }

      return res.json(respuesta);
    }

    return res.json({
      success: true,
      message: mensajeGenerico
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al solicitar recuperación'
    });
  }
});

// POST /api/auth/password/validate
router.post('/api/auth/password/validate', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    const tokenInfo = obtenerTokenRecuperacionValido(token);
    if (!tokenInfo) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    return res.json({
      success: true,
      message: 'Token válido para cambio de contraseña'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al validar token'
    });
  }
});

// POST /api/auth/password/reset
router.post('/api/auth/password/reset', (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token y contraseña requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const tokenInfo = obtenerTokenRecuperacionValido(token);
    if (!tokenInfo) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    const usuario = usuarios.find((u) => u.id === tokenInfo.usuarioId);
    if (!usuario) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    usuario.password = password;
    tokensRecuperacion[tokenInfo.tokenHash].usado = true;
    delete tokensRecuperacion[tokenInfo.tokenHash];
    eliminarSesionesUsuario(usuario.id);
    limpiarCookieSesion(res);

    return res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña'
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
router.protegerVista = protegerVista;

module.exports = router;
