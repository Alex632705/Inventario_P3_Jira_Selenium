const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email corporativo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 8
  },
  rol: {
    type: String,
    enum: ['admin', 'inventario', 'consulta'],
    default: 'consulta'
  },
  departamento: {
    type: String,
    required: [true, 'El departamento es obligatorio'],
    enum: ['TI', 'Almacén', 'Contabilidad', 'Gerencia', 'Ventas']
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaIngreso: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encriptar password antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar password
UsuarioSchema.methods.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);