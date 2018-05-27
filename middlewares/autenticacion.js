var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


// *****************************************
//      Verificar Token
// *****************************************
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify( token, SEED, (err, decoded) => {

        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });


};


// *****************************************
//      Verificar administrador
// *****************************************
exports.verificaAdmin = function(req, res, next) {

    var usuario = req.usuario;

    if( usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es admin',
            errors: {
                message: 'No tiene permisos para realizar petición'
            }
        });
    }


};


// *****************************************
//      Verificar administrador o mismo user
// *****************************************
exports.verificaAdminOMismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if( usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: {
                message: 'No tiene permisos para realizar petición'
            }
        });
    }


};


