var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var medicoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del Médico es requerido']
    },
    img: {
        type: String,
        required: false
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El campo ID Hospital es un campo obligatorio']
    }
});

module.exports = mongoose.model('Medico', medicoSchema);