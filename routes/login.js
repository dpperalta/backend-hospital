var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

// Declaraciones de google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/********************************************* 
    Autenticación usuario Google
**********************************************/
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//Es necesario instalar la dependencia npm install google-auth-library --save
app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            /*return res.status(500).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: e
            });*/
            return;
        });
    console.log("googleUser: ", googleUser);

    if (googleUser === undefined) {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido'
        });
    } else {
        Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al registrar usuario de Google',
                    errors: err
                });
            }
            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario ya tiene una cuenta en la aplicación'
                    });
                } else {
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14400 = 4 horas
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Autenticación correcta',
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                }
            } else {
                var usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)';

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: '¡Ha ocurrido un error al grabar usuario de Google!',
                            errors: err
                        });
                    }
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14400 = 4 horas
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Autenticación correcta',
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                });
            }
        });
    }
});

/********************************************* 
    Autenticación de usuario de la APP
**********************************************/
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