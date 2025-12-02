const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Modelo simple de usuario
const usuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    rol: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Login simple
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({ email, activo: true });
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña (simple - sin encriptar por ahora)
        if (usuario.password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;