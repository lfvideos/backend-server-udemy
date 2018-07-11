// Requires
var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();


var Hospital = require('../models/hospital');

// ========================================
//      Obtener todos los Hospitales
// ========================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (error, data) => {

                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error de Base de Datos',
                        errors: error
                    });
                }

                Hospital.count({}, (error, conteo) => {
                    response.status(200).json({
                        ok: true,
                        mensaje: 'Peticion GET de Hospitales',
                        hospitals: data,
                        total: conteo,
                    });
                });


            });

});






// ========================================
//      Actualizar Hospital
// ========================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (error, hospital) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: error
            });
        }
        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El Hospital con el id:' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario;

        hospital.save((error, hospitalGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado exitosamente',
                hospital: hospitalGuardado
            });
        });

    });

});


// ========================================
//      Crear un nuevo Hospital
// ========================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {

    var body = request.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario,
    });



    hospital.save((error, hospitalGuardado) => {

        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: error
            });
        }
        response.status(201).json({
            ok: true,
            mensaje: 'Hospital creado exitosamente',
            hospital: hospitalGuardado
        });

    });

});


// ========================================
//      Eliminar Hospital
// ========================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {

    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {
        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'Error al borrar el hospital' }
            });
        }
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            mensaje: 'Hospital borrado exitosamente',
            hospital: hospitalBorrado
        });
    });

});



module.exports = app;