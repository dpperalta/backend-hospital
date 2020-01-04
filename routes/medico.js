var express = require('express');

var mAutentication = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

/********************************************* 
    Obtener todos los médicos GET
**********************************************/
app.get('/', (req, res) => {

    var desde = req.query.desde;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital') // Se agrega un nuevo populate para obtener datos de una segunda tabla
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: '¡Ha ocurrido un error al buscar el médico!',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        medicos,
                        total: conteo
                    });
                });
            }
        );
});

/********************************************* 
    Actualizar los médicos PUT
**********************************************/
app.put('/:id', mAutentication.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al actualizar el Médico!',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el ID ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            })
        }
        medico.nombre = body.nombre,
            medico.usuario = req.usuario._id,
            medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: '¡Ha ocurrido un error al actualizar el Médico!',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                mensaje: 'Médico actualizado satisfactoriamente',
                medico: medicoGuardado
            });
        });
    });
});

/********************************************* 
    Crear los médicos POST
**********************************************/
app.post('/', mAutentication.verificarToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al guardar el médico!',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            mensaje: 'Médico creado satisfactoriamente',
            medico: medicoGuardado
        });
    });
});

/********************************************* 
    Eliminar los médicos DELETE
**********************************************/
app.delete('/:id', mAutentication.verificarToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al eliminar el médico!',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el ID ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }
        return res.status(200).json({
            ok: true,
            mensaje: 'Médico borrado satisfactoriamente',
            medico: medicoBorrado
        });
    });
});

module.exports = app;