const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_inventario');
    req.usuario = await Usuario.findById(decoded.id).select('-password');
    
    if (!req.usuario || !req.usuario.activo) {
      return res.status(401).json({ error: 'Token inválido o usuario desactivado.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = { verificarToken };