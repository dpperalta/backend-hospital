var express = require('express');

var mAutentication = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

/********************************************* 
    Obtener hospitales GET
**********************************************/
app.get('/', (req, res) => {
    var desde = req.query.desde;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') //el primer parámetro es la tabla, el segundo parámetro son los campos a mostrar
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: '¡Ha ocurrido un error al obtener el hospital!',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        hospitales,
                        total: conteo
                    });
                });
            }
        );
});

/********************************************* 
    Actualizar hospitales PUT
**********************************************/
app.put('/:id', mAutentication.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al actualizar hospital!',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ID ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre
        hospital.usuario = req.usuario._id

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: '¡Ha ocurrido un error al actualizar el hospital!',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado satisfactoriamente',
                hospitales: hospitalGuardado
            });
        });
    });
});


/********************************************* 
    Crear hospitales POST
**********************************************/
app.post('/', mAutentication.verificarToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al guardar el Hospital!',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            mensaje: 'Hospiatal guardado satisfactoriamente',
            hospital: hospitalGuardado
        });
    });
});

/********************************************* 
    Eliminar hospitales DELETE
**********************************************/
app.delete('/:id', mAutentication.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: '¡Ha ocurrido un error al eliminar hospital!',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ID ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            })
        }
        return res.status(200).json({
            ok: true,
            mensaje: 'Hospital eliminado satisfactoriamente',
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;