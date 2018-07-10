// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();


var Usuario = require('../models/usuario');

// ========================================
//      Obtener todos los usuarios
// ========================================
app.get('/', (request, response, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (error, data) => {

                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error de Base de Datos',
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    mensaje: 'Peticion GET de Usuarios',
                    usuarios: data
                });

            });

});




// ========================================
//      Actualizar Usuario
// ========================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (error, usuario) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }
        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El Usuario con el id:' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: error
                });
            }
            usuarioGuardado.password = ':)';

            response.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado exitosamente',
                usuario: usuarioGuardado
            });
        });





    });


});


// ========================================
//      Crear un nuevo Usuario
// ========================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {

    var body = request.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });



    usuario.save((error, data) => {

        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: error
            });
        }
        response.status(201).json({
            ok: true,
            mensaje: 'Usuario creado exitosamente',
            usuario: data
        });

    });

});


// ========================================
//      Eliminar Usuario
// ========================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {

    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'Error al borrar el usuario' }
            });
        }
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            mensaje: 'Usuario borrado exitosamente',
            usuario: usuarioBorrado
        });
    });

});



module.exports = app;