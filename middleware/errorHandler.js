/**
 * Middleware para manejo centralizado de errores en la aplicación
 * @description Captura errores en el pipeline de Express y los responde de forma consistente
 * @author Maya - Senior Full-Stack Developer
 * @version 1.0.0
 */

/**
 * Manejador de errores centralizado
 * @param {Error} err - Error capturado
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 * @returns {Object} Response con código de error y mensaje
 */
const errorHandler = (err, req, res, next) => {
  // Log del error (en producción, usar logger como winston)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} - Error: ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode || err.status || 500,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Definir código de estado por defecto
  const statusCode = err.statusCode || err.status || 500;
  const statusMessage = err.statusMessage || getErrorMessage(statusCode);

  // Objeto de respuesta estándar
  const errorResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: {
      code: statusCode,
      message: err.message || statusMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // Manejo de errores específicos
  if (err.name === 'ValidationError') {
    errorResponse.error.code = 400;
    errorResponse.error.message = 'Datos de entrada inválidos';
    errorResponse.error.details = err.details || [];
  }

  if (err.name === 'CastError') {
    errorResponse.error.code = 400;
    errorResponse.error.message = 'ID inválido';
  }

  if (err.name === 'JsonWebTokenError') {
    errorResponse.error.code = 401;
    errorResponse.error.message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse.error.code = 401;
    errorResponse.error.message = 'Token expirado';
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

/**
 * Obtiene mensaje de error por código de estado
 * @param {number} statusCode - Código de estado HTTP
 * @returns {string} Mensaje de error
 */
const getErrorMessage = (statusCode) => {
  const messages = {
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso prohibido',
    404: 'Recurso no encontrado',
    409: 'Conflicto de datos',
    422: 'Datos no procesables',
    500: 'Error interno del servidor',
    503: 'Servicio no disponible'
  };

  return messages[statusCode] || 'Error desconocido';
};

/**
 * Middleware para manejar errores no capturados
 * @description Debe ser el último middleware antes de los errores
 * @returns {Function} Middleware Express
 */
const globalErrorHandler = (err, req, res, next) => {
  // Si el error ya fue manejado, continuar
  if (res.headersSent) {
    return next(err);
  }

  // Manejar errores asíncronos
  if (err instanceof Error) {
    return errorHandler(err, req, res, next);
  }

  // Manejar errores no esperados
  const error = new Error('Error desconocido');
  error.statusCode = 500;
  return errorHandler(error, req, res, next);
};

module.exports = {
  errorHandler,
  globalErrorHandler
};