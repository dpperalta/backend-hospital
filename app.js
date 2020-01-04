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
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Iniciar Base de Datos
mongoose.connect('mongodb://localhost/hospitalBD', (err, res) => {

    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'corriendo');
});

// Server Index Config - Librería para mostrar un navegador de archivos en las URL (muestra todos los archivos en el server)
/*var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));*/

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server en puerto 3000: \x1b[32m%s\x1b[0m', ' corriendo');
});