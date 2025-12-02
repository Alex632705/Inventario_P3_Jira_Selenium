const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productoRoutes = require('./routes/productos');
const path = require('path');
const { DB_USER, DB_PASSWORD, DB_NAME } = require('./DB_USER');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.stjwrlt.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(DB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('Error de conexión:', err.message);
  });

// Archivos estáticos
app.use('/uploads', express.static('public/uploads'));
app.use(express.static('../public'));

// Rutas de la API
app.use('/api/productos', productoRoutes);

// ===== RUTAS DE AUTENTICACIÓN CON BASE DE DATOS =====

// Modelo simple de usuario
const usuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    rol: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Ruta de login que usa la base de datos
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Intento de login:', email);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario en la base de datos
        const usuario = await Usuario.findOne({ email, activo: true });
        
        if (!usuario) {
            console.log('Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña (sin encriptar por ahora)
        if (usuario.password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Login exitoso para:', usuario.nombre);

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


app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/index.html', (req, res) => {
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});