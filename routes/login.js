// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();


var Usuario = require('../models/usuario');

//Google
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);


// ========================================
//      Autenticacion Normal
// ========================================
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
            SEED, { expiresIn: 144000 } //4 horas
        );


        response.status(200).json({
            ok: true,
            mensaje: 'Login Post Correcto',
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token,
            menu: obtenerMenu(usuarioDB.role),
        });

    });


});


// ========================================
//      Autenticacion de Google
// ========================================


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
        google: true,
    }
}




app.post('/google', async(request, response) => {

    var token = request.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return response.status(403).json({
                ok: false,
                message: "Token no Valido",
            });
        });

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: error
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB },
                    SEED, { expiresIn: 144000 } //4 horas
                );


                return response.status(200).json({
                    ok: true,
                    mensaje: 'Login Post Correcto',
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role),
                });
            }
        } else { //Primera vez que el usuario hace login
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            var token = jwt.sign({ usuario: usuarioDB },
                SEED, { expiresIn: 144000 } //4 horas
            );

            usuario.save((error, usuarioDB) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Login Post Correcto',
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role),
                });
            });
        }
    });


});

function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJS', url: '/rxjs' },

            ],

        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ],

        },
        {
            titulo: 'Custom',
            icono: 'mdi mdi-anchor',
            submenu: [
                { titulo: 'REST Index', url: '/restindex' },
                { titulo: 'Permisos', url: '/permisos' },

            ],

        }
    ];

    if (ROLE == 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }


    return menu;

}

module.exports = app;