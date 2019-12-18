// Requires
var express = require('express');
var mongoose = require('mongoose');

// Iniciar Express
var app = express();

// Iniciar Base de Datos
mongoose.connect('mongodb://localhost/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'corriendo');
});


// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server en puerto 3000: \x1b[32m%s\x1b[0m', ' corriendo');
});