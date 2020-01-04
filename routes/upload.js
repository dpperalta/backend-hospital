var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs'); //Se importa el file system fs para eliminar los archivos duplicados

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Realizar la validación de tipos de colecciones
    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];
    //console.log('tipo: ' + tipo + " value:" + tiposValidos.indexOf(tipo));

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Se intenta subir un tipo no válido',
            errors: { message: 'Los tipos permitidos son: ' + tiposValidos.join(', ') }
        })
    }

    // Validar si se ha cargado un archivo en la petición
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha cargado ningún archivo',
            errors: { message: 'Se debe seleccionar una imágen' }
        });
    }

    //Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Extensiones de archivos permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'bmp'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ') }
        })
    }

    //Poner un nombre personalizado al archivo para evitar que se sobrescriban o dupliquen
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`

    //Mover archivo al path del  servidor de archivos para su almacenamiento definitivo
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    })

})

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el ID ' + id + ' no existe',
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }
            var pathAnterior = './uploads/usuarios/' + usuario.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: '¡Ha ocurrido un error al actualizar la imagen del usuario!',
                        errors: err
                    })
                }
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del Usuario actualizado satisfactoriamente',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico con el ID ' + id + ' no existe',
                    errors: { message: 'No existe un médico con ese ID' }
                });
            }
            var pathAnterior = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: '¡Ha ocurrido un error al actualizar la imagen del médico!',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del Médico actualizada satisfactoriamente',
                    medico: medicoActualizado
                });
            });
        });

    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el ID ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            var pathAnterior = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: '¡Ha ocurrido un error al actualizar la imagen del hospital!',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Hospital actualizada satisfactoriamente',
                    hospital: hospitalActualizado
                });
            });

        });

    }

}

module.exports = app;