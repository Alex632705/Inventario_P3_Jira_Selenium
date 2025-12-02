const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    foto: {
        type: String,
        default: 'default.jpg'
    },
    descripcion: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Producto', ProductoSchema);