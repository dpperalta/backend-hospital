var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al autenticar el usuario!',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La información ingresada es incorrecta - eMail'
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La información ingresada es incorrecta - Passw0rd'
            });
        }

        // Crear un token para el usuario
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14400 = 4 horas

        return res.status(200).json({
            ok: true,
            mensaje: 'Autenticación correcta',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        })
    });
});

module.exports = app;