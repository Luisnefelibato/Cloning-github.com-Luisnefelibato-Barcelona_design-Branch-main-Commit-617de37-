/**
 * Controlador principal para la gestión de recursos
 * @module mainController
 */

const { validationResult } = require('express-validator');
const { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem 
} = require('../services/mainService');

/**
 * Obtiene todos los elementos con paginación y filtros
 * @async
 * @function getAllItemsHandler
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con los elementos encontrados o error
 */
const getAllItemsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    
    const result = await getAllItems({
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      message: 'Items retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAllItemsHandler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Obtiene un elemento por su ID
 * @async
 * @function getItemByIdHandler
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con el elemento o error
 */
const getItemByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validación de ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID parameter'
      });
    }

    const item = await getItemById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Item retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getItemByIdHandler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Crea un nuevo elemento
 * @async
 * @function createItemHandler
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con el elemento creado o error
 */
const createItemHandler = async (req, res) => {
  try {
    // Validación de datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, category } = req.body;
    
    const newItem = await createItem({
      name,
      description,
      category,
      createdBy: req.user?.id || null
    });

    return res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error in createItemHandler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Actualiza un elemento existente
 * @async
 * @function updateItemHandler
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con el elemento actualizado o error
 */
const updateItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validación de ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID parameter'
      });
    }

    // Validación de datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, category } = req.body;
    
    const updatedItem = await updateItem(id, {
      name,
      description,
      category,
      updatedBy: req.user?.id || null
    });

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error in updateItemHandler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Elimina un elemento por su ID
 * @async
 * @function deleteItemHandler
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con mensaje de confirmación o error
 */
const deleteItemHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validación de ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID parameter'
      });
    }

    const deleted = await deleteItem(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteItemHandler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllItemsHandler,
  getItemByIdHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler
};