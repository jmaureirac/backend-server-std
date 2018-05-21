var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
app.use(fileUpload());

var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');


// *****************************************
//      Actualizar imagen
// *****************************************
app.put('/:tipo/:id', (req, res, next) => {

    var id = req.params.id;
    var tipo = req.params.tipo;

    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];
    if( tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion inválido',
            errors: { message: 'Tipo de coleccion inválido' }
        });
    }

    if( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono imagen',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var archivoSplit = archivo.name.split('.');
    var extension = archivoSplit[ archivoSplit.length - 1 ];

    // Extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extensionesValidas.indexOf( extension ) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
        
    }

    // Nombre de archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Mover archivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if( err ) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al mover archivo',
               errors: err
           });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );
        
    });

});

function subirPorTipo( tipo, id, nombreArchivo, res ){

    if( tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if( err ) {
                return res.status(500).json({
                   ok: false,
                   mensaje: 'Error al buscar usuario',
                   errors: err
               });
            }

            if( !usuario ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathAntiguo = './uploads/usuarios/' + usuario.img;

            // Borrar si existe
            if( fs.existsSync(pathAntiguo) ) {
                fs.unlink(pathAntiguo);
            }
            
            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioUpdated) => {

                if( err ) {
                    return res.status(400).json({
                       ok: false,
                       mensaje: 'Error al actualizar la imagen',
                       errors: err
                   });
                }
                
                usuarioUpdated.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioUpdated
                });
            });
            

        });

    } else if( tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if( err ) {
                return res.status(500).json({
                   ok: false,
                   mensaje: 'Error al buscar medico',
                   errors: err
                });
            }

            if( !medico ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathAntiguo = './uploads/medicos/' + medico.img;

            // Borrar si existe
            if( fs.existsSync(pathAntiguo) ) {
                fs.unlink(pathAntiguo);
            }
            
            medico.img = nombreArchivo;

            medico.save( (err, medicoUpdated) => {

                if( err ) {
                    return res.status(400).json({
                       ok: false,
                       mensaje: 'Error al actualizar la imagen',
                       errors: err
                   });
                }
                

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoUpdated
                });
            });
            

        });

    } else if( tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if( err ) {
                return res.status(500).json({
                   ok: false,
                   mensaje: 'Error al buscar hospital',
                   errors: err
                });
            }

            if( !hospital ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathAntiguo = './uploads/hospitales/' + hospital.img;

            // Borrar si existe
            if( fs.existsSync(pathAntiguo) ) {
                fs.unlink(pathAntiguo);
            }
            
            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalUpdated) => {

                if( err ) {
                    return res.status(400).json({
                       ok: false,
                       mensaje: 'Error al actualizar la imagen',
                       errors: err
                   });
                }
                

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalUpdated
                });
            });
            

        });
    }

}

module.exports = app;

