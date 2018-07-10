// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();


var Usuario = require('../models/usuario');

app.post('/', (request, response) => {

    var body = request.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al autenticar al usuario',
                errors: error
            });
        }
        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales Invalidas',
                errors: { message: "Email no valido" }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales Invalidas',
                errors: { message: "Password no valido" }
            });
        }

        usuarioDB.password = ":)";

        //Crear Token
        var token = jwt.sign({ usuario: usuarioDB },
            SEED, { expiresIn: 14400 } //4 horas
        );


        response.status(200).json({
            ok: true,
            mensaje: 'Login Post Correcto',
            data: usuarioDB,
            id: usuarioDB._id,
            token: token,
        });

    });


});








module.exports = app;