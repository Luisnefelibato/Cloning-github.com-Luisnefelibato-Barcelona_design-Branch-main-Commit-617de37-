const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger, errorLogger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { validateRequest } = require('./middleware/validation');
const routes = require('./routes');

/**
 * @description Configuración y arranque del servidor Express
 * @returns {void}
 */
class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * @description Inicializa los middlewares principales del servidor
   * @returns {void}
   */
  initializeMiddleware() {
    // Protección de seguridad
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // límite de 100 solicitudes por IP
      message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.'
    });
    this.app.use(limiter);

    // Parseo de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use(logger);
  }

  /**
   * @description Configura las rutas de la aplicación
   * @returns {void}
   */
  initializeRoutes() {
    // Rutas principales
    this.app.use('/api', routes);

    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Ruta 404 para URLs no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
      });
    });
  }

  /**
   * @description Configura el manejo de errores
   * @returns {void}
   */
  initializeErrorHandling() {
    // Logging de errores
    this.app.use(errorLogger);

    // Manejo de errores centralizado
    this.app.use(errorHandler);
  }

  /**
   * @description Inicia el servidor HTTP
   * @returns {Promise<void>}
   */
  async start() {
    try {
      const server = this.app.listen(this.port, () => {
        console.log(`Servidor corriendo en http://localhost:${this.port}`);
      });

      // Manejo de señales de proceso
      process.on('SIGTERM', () => {
        console.log('SIGTERM recibido, cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log('SIGINT recibido, cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    }
  }
}

// Inicialización del servidor
const server = new Server();

// Exportar para pruebas o uso en otros archivos
module.exports = { server, Server };