// Requires
var express = require('express');
var mongoose = require('mongoose');
var colors = require('colors');


// Inicializar variables
var app = express();


// Conexion BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res ) => {
    
    if ( err ) throw err;

    console.log('Base de datos:', 'online'.green);

});


// Rutas
app.get('/', (req, res, next) => {

    return res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });

});

// Listener
app.listen(3000, () => {
    console.log('Express server listen 3000:', 'online'.green);
});