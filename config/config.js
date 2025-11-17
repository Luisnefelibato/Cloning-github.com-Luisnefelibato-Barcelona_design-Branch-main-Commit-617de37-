/**
 * Configuración centralizada de la aplicación
 * @module config
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Configuración de la aplicación
 * @typedef {Object} AppConfig
 * @property {string} env - Entorno de ejecución (development, production, test)
 * @property {number} port - Puerto del servidor
 * @property {string} host - Host del servidor
 * @property {string} databaseUrl - URL de conexión a la base de datos
 * @property {string} jwtSecret - Clave secreta para JWT
 * @property {number} jwtExpiration - Tiempo de expiración del JWT en segundos
 * @property {string} redisUrl - URL de conexión a Redis
 * @property {string} logLevel - Nivel de logging (error, warn, info, debug)
 * @property {boolean} enableCors - Habilitar CORS
 * @property {string} uploadPath - Ruta de almacenamiento de archivos
 * @property {number} maxFileSize - Tamaño máximo de archivo en bytes
 */

/**
 * Valida que las variables de entorno requeridas estén definidas
 * @param {Object} env - Variables de entorno
 * @throws {Error} Si falta alguna variable requerida
 */
function validateEnv(env) {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Obtiene la configuración de la aplicación
 * @async
 * @returns {Promise<AppConfig>} Configuración de la aplicación
 */
async function getConfig() {
  try {
    // Validar variables de entorno
    validateEnv(process.env);
    
    // Configuración base
    const config = {
      env: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || 'localhost',
      databaseUrl: process.env.DATABASE_URL,
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiration: parseInt(process.env.JWT_EXPIRATION) || 3600,
      redisUrl: process.env.REDIS_URL || null,
      logLevel: process.env.LOG_LEVEL || 'info',
      enableCors: process.env.ENABLE_CORS === 'true',
      uploadPath: process.env.UPLOAD_PATH || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
    };

    // Crear directorio de uploads si no existe
    if (config.uploadPath) {
      try {
        await fs.access(config.uploadPath);
      } catch (error) {
        await fs.mkdir(config.uploadPath, { recursive: true });
      }
    }

    return config;
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw new Error('Failed to load application configuration');
  }
}

/**
 * Obtiene una variable de entorno con valor por defecto
 * @param {string} key - Nombre de la variable
 * @param {any} defaultValue - Valor por defecto
 * @returns {string|number|boolean} Valor de la variable
 */
function getEnvVariable(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  // Convertir tipos según el valor
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value) && !isNaN(parseFloat(value))) return parseFloat(value);
  
  return value;
}

module.exports = {
  getConfig,
  getEnvVariable
};