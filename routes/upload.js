// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

app.use(fileUpload());


var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ========================================
//      Actualizar Foto
// ========================================
app.put('/:tipo/:id', (request, response, next) => {

    var tipo = request.params.tipo;
    var id = request.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valido',
            errors: { message: "Tipo de coleccion no valida. Los tipos validos son " + tiposValidos.join(', ') }
        });
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No se encontraron archivos',
            errors: { message: "debe de seleccionar una imagen" }
        });
    }

    // Obtener el nombre del archivo
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: "La extensiones validas son " + extensionesValidas.join(', ') }
        });
    }


    //  Nombre del archivo perzonalizado
    // {idUsuario}-{numeroRandom}-{extension}
    var nombreaArchivo = `${id}-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del TEMP a un path
    var path = `./uploads/${tipo}/${nombreaArchivo}`;

    archivo.mv(path, error => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: error
            });
        }

        subirPorTipo(tipo, id, nombreaArchivo, response)

        // response.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido'
        // });
    });



});



function subirPorTipo(tipo, id, nombreaArchivo, response) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (error, usuario) => {

            if (error || usuario == null) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario con ese ID',
                    errors: { message: "No existe el usuario con ese ID" }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar el archivo',
                            errors: error
                        });
                    }
                });
            }

            usuario.img = nombreaArchivo;

            usuario.save((error, usuarioActualizado) => {
                usuarioActualizado.password = ":)";
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado,
                });
            });


        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (error, medico) => {

            if (error || medico == null) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico con ese ID',
                    errors: { message: "No existe el medico con ese ID" }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //Elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar el archivo',
                            errors: error
                        });
                    }
                });
            }

            medico.img = nombreaArchivo;

            medico.save((error, medicoActualizado) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico Actualizada',
                    medico: medicoActualizado,
                });
            });


        });


    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (error, hospital) => {

            if (error || hospital == null) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital con ese ID',
                    errors: { message: "No existe el hospital con ese ID" }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar el archivo',
                            errors: error
                        });
                    }
                });
            }

            hospital.img = nombreaArchivo;

            hospital.save((error, hospitalActualizado) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital Actualizada',
                    hospital: hospitalActualizado,
                });
            });


        });



    }

}



module.exports = app;