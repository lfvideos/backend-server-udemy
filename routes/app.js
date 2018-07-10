// Requires
var express = require('express');

var app = express();

app.get('/', (request, response, next) => {
    response.status(201).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

module.exports = app;