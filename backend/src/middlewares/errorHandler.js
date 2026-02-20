const notFound = (req, res, next) => {
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const acceptsHtml = req.accepts('html');
  const isNotFound = statusCode === 404;
  
  if (acceptsHtml) {
    const html404 = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusCode === 404 ? 'Página no encontrada' : 'Error del servidor'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .error-container { max-width: 600px; margin: 0 auto; }
          h1 { color: #d32f2f; }
          .breadcrumbs { margin: 20px 0; }
          .breadcrumbs a { color: #1976d2; text-decoration: none; margin: 0 5px; }
          .breadcrumbs a:hover { text-decoration: underline; }
          .error-image { display: block; max-width: 100%; height: auto; margin: 24px auto 0; }
          .cta-wrapper { text-align: center; margin-top: 18px; }
          .cta-button {
            display: inline-block;
            background: #1976d2;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(25, 118, 210, 0.35);
          }
          .cta-button:hover { background: #1565c0; }
          .next-steps { background: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 20px; }
          button { background: #1976d2; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
          button:hover { background: #1565c0; }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1 class="${isNotFound ? 'sr-only' : ''}">${isNotFound ? 'Error 404 - Página no encontrada' : 'Error 500 - Error del servidor'}</h1>
          
          <div role="status" aria-live="polite" aria-label="Alerta de error" class="${isNotFound ? 'sr-only' : ''}">
            <p>${isNotFound ? 'La página que buscas no existe.' : 'Ocurrió un error en el servidor. Por favor, intenta de nuevo.'}</p>
          </div>

          ${isNotFound ? `
            <img class="error-image" src="/img/Error_404.png" alt="Ilustración de error 404" />
            <div class="cta-wrapper">
              <a class="cta-button" href="/">Volver al inicio</a>
            </div>
          ` : `
            <img class="error-image" src="/img/error_500.png" alt="Ilustración de error 500" />
            <div class="cta-wrapper">
              <a class="cta-button" href="/">Volver al inicio</a>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    
    res.status(statusCode).send(html404);
  } else {
    res.status(statusCode).json({
      mensaje: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }
};

module.exports = { notFound, errorHandler };
