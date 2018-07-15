var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ========================================
//      Verificar Token
// ========================================
exports.verificaToken = function(request, response, next) {

    var token = request.query.token;
    jwt.verify(token, SEED, (error, decoded) => {

        if (error) {
            return response.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: error
            });
        }

        request.usuario = decoded.usuario;
        next();

        // return response.status(200).json({
        //     ok: true,
        //     decoded: decoded,
        // });
    });

}


// ========================================
//      Verificar ADMIN
// ========================================
exports.verificaADMIN = function(request, response, next) {

    var usuario = request.usuario;
    if (usuario.role == "ADMIN_ROLE") {
        next();
        return;
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Error de Privilegios',
        });
    }

}


// ========================================
//      Verificar ADMIN o Mismo Usuario
// ========================================
exports.verificaADMIN_o_MismoUsuario = function(request, response, next) {

    var usuario = request.usuario;
    var id = request.params.id;

    if (usuario.role == "ADMIN_ROLE" || usuario._id == id) {
        next();
        return;
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Error de Privilegios',
        });
    }

}