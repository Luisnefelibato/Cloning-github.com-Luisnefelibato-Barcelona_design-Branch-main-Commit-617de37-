const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta principal de la aplicación
 *     description: Retorna un mensaje de bienvenida
 *     responses:
 *       200:
 *         description: Éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bienvenido a la API"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
  try {
    res.status(200).json({ 
      message: 'Bienvenido a la API',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en ruta principal:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificación de salud de la aplicación
 *     description: Retorna el estado de salud de la API
 *     responses:
 *       200:
 *         description: Éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   example: "2023-01-01T00:00:00.000Z"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/health', async (req, res) => {
  try {
    res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en ruta de salud:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

/**
 * @swagger
 * /error:
 *   get:
 *     summary: Ruta de prueba para errores
 *     description: Retorna un error intencional para testing
 *     responses:
 *       500:
 *         description: Error intencional
 */
router.get('/error', async (req, res) => {
  try {
    throw new Error('Error de prueba intencional');
  } catch (error) {
    console.error('Error intencional lanzado:', error);
    res.status(500).json({ 
      error: 'Error de prueba',
      message: error.message 
    });
  }
});

module.exports = router;