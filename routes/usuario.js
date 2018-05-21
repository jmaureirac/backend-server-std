var express = require('express');
var brcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');


// *****************************************
//      Obtener todos los usuarios
// *****************************************
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({ }, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) =>{
                        
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }
                
                Usuario.count({}, (err, cantidad) => {

                    if( err ) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error contando usuarios',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: cantidad
                    });
                    
                });

        });

});


// *****************************************
//      Insertar un nuevo usuario
// *****************************************
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: brcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioSaved) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioSaved,
            usuarioToken: req.usuario
        });

    });

    

});


// *****************************************
//      Actualizar un usuario
// *****************************************
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    
    Usuario.findById( id, (err, usuario) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if( !usuario ) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${ id } no existe`,
                errors: {
                    message : 'No existe un usuario con ese id'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioSaved) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuario.password = ':)';
            
            res.status(200).json({
                ok: true,
                usuario: usuarioSaved
            });

        });

    });

});


// *****************************************
//      Eliminar un usuario
// *****************************************
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioDeleted) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar usuario',
                errors: err
            });
        }

        if( !usuarioDeleted ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: {
                    message : 'No existe un usuario con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioDeleted
        });
    });

});


module.exports = app;

