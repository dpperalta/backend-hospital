var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

/********************************************* 
    Verificar TOKEN
**********************************************/
exports.verificarToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            res.redirect('/');
            return res.status(401).json({
                ok: false,
                mensaje: '¡Token Incorrecto!',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}