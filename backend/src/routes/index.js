const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

// Almacenamiento en memoria para las citas
let citas = [];
let contadorId = 1;

// ============================================
// RUTAS API REST
// ============================================

/**
 * GET /api/citas
 * Obtiene todas las citas
 * Manejo de errores: Captura errores internos
 */
router.get('/api/citas', (req, res) => {
  try {
    // Simular latencia de red (100-300ms)
    const latencia = Math.floor(Math.random() * 200) + 100;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: citas,
        total: citas.length
      });
    }, latencia);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno al obtener citas',
      details: error.message
    });
  }
});

/**
 * POST /api/citas
 * Crea una nueva cita
 * Manejo de errores: Validación de datos, errores internos
 */
router.post('/api/citas', (req, res) => {
  try {
    const { cliente, fecha, hora } = req.body;
    
    // Validar campos requeridos
    if (!cliente || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos',
        details: 'Se requieren: cliente, fecha, hora'
      });
    }
    
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido',
        details: 'Use formato YYYY-MM-DD'
      });
    }
    
    // Validar formato de hora
    if (!/^\d{2}:\d{2}$/.test(hora)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de hora inválido',
        details: 'Use formato HH:MM'
      });
    }
    
    // Crear nueva cita
    const nuevaCita = {
      id: contadorId++,
      cliente: cliente.trim(),
      fecha,
      hora,
      createdAt: new Date().toISOString()
    };
    
    citas.push(nuevaCita);
    
    // Simular latencia
    setTimeout(() => {
      res.status(201).json({
        success: true,
        data: nuevaCita,
        message: `Cita creada para ${nuevaCita.cliente}`
      });
    }, 150);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno al crear cita',
      details: error.message
    });
  }
});

/**
 * DELETE /api/citas/:id
 * Elimina una cita por ID
 * Manejo de errores: Cita no encontrada, ID inválido, errores internos
 */
router.delete('/api/citas/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validar ID
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        details: 'El ID debe ser un número'
      });
    }
    
    // Buscar cita
    const index = citas.findIndex(c => c.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada',
        details: `No existe cita con ID ${id}`
      });
    }
    
    // Eliminar cita
    const citaEliminada = citas.splice(index, 1)[0];
    
    // Simular latencia
    setTimeout(() => {
      res.json({
        success: true,
        data: citaEliminada,
        message: `Cita de ${citaEliminada.cliente} eliminada`
      });
    }, 150);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno al eliminar cita',
      details: error.message
    });
  }
});

// ============================================
// RUTAS HTML
// ============================================

const generarPaginaHTML = (titulo, breadcrumbs, contenido) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titulo} - Sistema de Gestión de Citas</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; }
        nav.menu { background: #1976d2; padding: 15px; }
        nav.menu ul { list-style: none; display: flex; gap: 20px; flex-wrap: wrap; }
        nav.menu a { color: white; text-decoration: none; padding: 8px 12px; display: block; }
        nav.menu a:hover, nav.menu a:focus { background: #1565c0; outline: 2px solid white; }
        .breadcrumbs { background: #f5f5f5; padding: 10px 20px; }
        .breadcrumbs a { color: #1976d2; text-decoration: none; margin: 0 5px; }
        .breadcrumbs a:hover, .breadcrumbs a:focus { text-decoration: underline; outline: 2px solid #1976d2; }
        .breadcrumbs span { color: #666; }
        main { padding: 30px; max-width: 1200px; margin: 0 auto; }
        h1 { color: #1976d2; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <nav class="menu" role="navigation" aria-label="Menú principal">
        <ul>
          <li><a href="/" tabindex="0">Inicio</a></li>
          <li><a href="/login" tabindex="0">Login</a></li>
          <li><a href="/registro" tabindex="0">Registro</a></li>
          <li><a href="/agendar" tabindex="0">Agendar</a></li>
          <li><a href="/dashboard" tabindex="0">Dashboard</a></li>
          <li><a href="/citas" tabindex="0">Citas</a></li>
          <li><a href="/clientes" tabindex="0">Clientes</a></li>
        </ul>
      </nav>
      
      <nav class="breadcrumbs" aria-label="Ruta de navegación" role="navigation">
        ${breadcrumbs}
      </nav>

      <main role="main">
        ${contenido}
      </main>
    </body>
    </html>
  `;
};

router.get('/', (req, res) => {
  const acceptsHtml = req.accepts('html');
  
  if (acceptsHtml) {
    const html = generarPaginaHTML(
      'Inicio',
      '<a href="/">Inicio</a>',
      `
        <h1>Sistema de Gestión de Citas</h1>
        <p>Bienvenido al sistema de gestión de citas para negocios locales.</p>
        <ul>
          <li><a href="/login">Iniciar sesión</a></li>
          <li><a href="/registro">Crear cuenta</a></li>
          <li><a href="/agendar">Agendar cita</a></li>
        </ul>
      `
    );
    return res.send(html);
  }
  
  res.json({
    mensaje: 'API Sistema de Gestión de Citas',
    rutas: {
      inicio: '/', login: '/login', registro: '/registro',
      agendar: '/agendar', dashboard: '/dashboard',
      citas: '/citas', clientes: '/clientes'
    }
  });
});

router.get('/login', (req, res) => {
  const path = require('path');
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'login.html'));
});

router.get('/recuperar', (req, res) => {
  const path = require('path');
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'recuperar.html'));
});

router.get('/registro', (req, res) => {
  const acceptsHtml = req.accepts('html');
  
  if (acceptsHtml) {
    const html = generarPaginaHTML(
      'Registro',
      '<a href="/">Inicio</a> <span>/</span> <span>Registro</span>',
      `
        <h1>Crear Cuenta</h1>
        <p>Regístrate para comenzar a agendar citas.</p>
      `
    );
    return res.send(html);
  }
  
  res.json({ mensaje: 'Ruta de registro' });
});

router.get('/agendar', (req, res) => {
  const acceptsHtml = req.accepts('html');
  
  if (acceptsHtml) {
    const html = generarPaginaHTML(
      'Agendar Cita',
      '<a href="/">Inicio</a> <span>/</span> <span>Agendar</span>',
      `
        <h1>Agendar Cita</h1>
        <p>Selecciona fecha y hora para tu cita.</p>
      `
    );
    return res.send(html);
  }
  
  res.json({ mensaje: 'Ruta para agendar citas' });
});

router.get('/dashboard', (req, res) => {
  const acceptsHtml = req.accepts('html');
  
  if (acceptsHtml) {
    const html = generarPaginaHTML(
      'Dashboard',
      '<a href="/">Inicio</a> <span>/</span> <span>Dashboard</span>',
      `
        <h1>Dashboard</h1>
        <p>Panel de control del sistema.</p>
      `
    );
    return res.send(html);
  }
  
  res.json({ mensaje: 'Dashboard - requiere autenticación' });
});

router.get('/citas', (req, res) => {
  const path = require('path');
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'citas.html'));
});

router.get('/clientes', (req, res) => {
  const acceptsHtml = req.accepts('html');
  
  if (acceptsHtml) {
    const html = generarPaginaHTML(
      'Gestión de Clientes',
      '<a href="/">Inicio</a> <span>/</span> <a href="/dashboard">Dashboard</a> <span>/</span> <span>Clientes</span>',
      `
        <h1>Gestión de Clientes</h1>
        <p>Administra la información de los clientes.</p>
      `
    );
    return res.send(html);
  }
  
  res.json({ mensaje: 'Gestión de clientes - requiere autenticación' });
});

router.get('/error-500', (req, res) => {
  throw new Error('Error interno de prueba');
});

// Usar rutas de autenticación
router.use(authRoutes);

module.exports = router;
