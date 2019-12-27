// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Iniciar Express
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar archivo de rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Iniciar Base de Datos
mongoose.connect('mongodb://localhost/hospitalBD', (err, res) => {

    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'corriendo');
});


// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server en puerto 3000: \x1b[32m%s\x1b[0m', ' corriendo');
});