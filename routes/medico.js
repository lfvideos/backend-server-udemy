// Requires
var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();


var Medico = require('../models/medico');

// ========================================
//      Obtener todos los Medicos
// ========================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
            (error, data) => {

                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error de Base de Datos',
                        errors: error
                    });
                }

                Medico.count({}, (error, conteo) => {
                    response.status(200).json({
                        ok: true,
                        mensaje: 'Peticion GET de medicos',
                        medico: data,
                        total: conteo,
                    });
                });



            });

});






// ========================================
//      Actualizar Medico
// ========================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (error, medico) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: error
            });
        }
        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El Medico con el id:' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = request.usuario;
        medico.hospital = body.hospital;

        medico.save((error, medicoGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                mensaje: 'Medico actualizado exitosamente',
                medico: medicoGuardado
            });
        });

    });

});


// ========================================
//      Crear un nuevo Medico
// ========================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {

    var body = request.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario,
        hospital: body.hospital
    });



    medico.save((error, data) => {

        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: error
            });
        }
        response.status(201).json({
            ok: true,
            mensaje: 'Medico creado exitosamente',
            medico: data
        });

    });

});


// ========================================
//      Eliminar Medico
// ========================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {

    var id = request.params.id;

    Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'Error al borrar el medico' }
            });
        }
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            mensaje: 'Medico borrado exitosamente',
            medico: medicoBorrado
        });
    });

});



module.exports = app;