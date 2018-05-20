// Requires
var express = require('express');
var mongoose = require('mongoose');
var colors = require('colors');
var bodyParser = require('body-parser');


// Inicializar variables
var app = express();


// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Conexion BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    
    if ( err ) throw err;

    console.log('Base de datos:', 'online'.green);

});


// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Listener
app.listen(3000, () => {
    console.log('Express server listen 3000:', 'online'.green);
});