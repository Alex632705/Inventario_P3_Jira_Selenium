const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');
const upload = require('../utils/fileUpload');


router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { codigo, nombre, descripcion, cantidad, precio } = req.body;
    
    const producto = new Producto({
      codigo,
      nombre,
      descripcion,
      cantidad,
      precio,
      foto: req.file ? req.file.filename : 'default.jpg'
    });

    await producto.save();
    res.status(201).send(producto);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/:id', upload.single('foto'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.foto = req.file.filename;
    }

    const producto = await Producto.findByIdAndUpdate(req.params.id, updates, { 
      new: true,
      runValidators: true
    });
    
    if (!producto) {
      return res.status(404).send();
    }
    res.send(producto);
  } catch (error) {
    res.status(400).send(error);
  }
});


router.post('/', async (req, res) => {
    try {
        const producto = new Producto(req.body);
        await producto.save();
        res.status(201).send(producto);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.send(productos);
    } catch (error) {
        res.status(500).send(error);
    }
});


router.get('/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).send();
        }
        res.send(producto);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!producto) {
            return res.status(404).send();
        }
        res.send(producto);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const producto = await Producto.findByIdAndDelete(req.params.id);
        if (!producto) {
            return res.status(404).send();
        }
        res.send(producto);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;