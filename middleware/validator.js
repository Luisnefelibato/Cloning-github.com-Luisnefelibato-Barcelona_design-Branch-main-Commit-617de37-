const { validationResult } = require('express-validator');

/**
 * Middleware de validación de requests
 * @description Valida los errores de validación y retorna un response adecuado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @returns {Object|undefined} Retorna un error 400 si hay validaciones fallidas, de lo contrario llama a next()
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during validation',
      error: error.message
    });
  }
};

module.exports = {
  validateRequest
};