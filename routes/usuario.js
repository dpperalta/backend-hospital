var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mAutenticacion = require('../middlewares/autenticacion');

//var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

/********************************************* 
    Obtener todos los usuarios GET
**********************************************/
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: '¡Error en la carga de usuarios!',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios,
                        total: conteo
                    });
                });

            });
});

/********************************************* 
    Actualizar usuarios PUT
**********************************************/
app.put('/:id', mAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al buscar el usuario!',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el ID ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: '¡Ha ocurrido un error al actualizar el usuario!',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            return res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado correctamente',
                usuario: usuarioGuardado
            });
        });
    });
});

/********************************************* 
    Crear usuarios POST
**********************************************/
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al guardar el usuario!',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado satisfactoriamente',
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

/********************************************* 
    Eliminar usuarios DELETE
**********************************************/
app.delete('/:id', mAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al eliminar el usuario!',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el ID ' + id + ' no existe',
                errors: { message: 'No se ha encontrado el usuario' }
            });
        }
        return res.status(200).json({
            ok: true,
            mensaje: 'Usuario eliminado satisfactoriamente',
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;