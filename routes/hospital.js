var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


// *****************************************
//      Obtener todos los hospitales
// *****************************************
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)  
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, cantidad) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: cantidad      
                    });
                });
            }
        );

});


// *****************************************
//      Insertar un hospital
// *****************************************
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id 
    });

    hospital.save( (err, hospitalSaved) => {

        if( err ) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al crear hospital',
               errors: err
           });
        }
        
        res.status(201).json({
            ok: true,
            hospital: hospitalSaved
        });
        
        

    });

});


// *****************************************
//      Actualizar un hospital
// *****************************************
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {

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
                mensaje: `El hospital con el id ${ id } no existe`,
                errors: {
                    message : 'No existe un hospital con ese id'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalSaved) => {

            if( err ) {
                return res.status(400).json({
                   ok: false,
                   mensaje: 'Error al actualizar el hospital',
                   errors: err
               });
            }
            
            res.status(200).json({
                ok: true,
                hospital: hospitalSaved
            });
            
        });
    });

});


// *****************************************
//      Eliminar un hospital
// *****************************************
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {

        if( err ) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al eliminar el hospital',
               errors: err
           });
        }
        
        if( !hospitalDeleted ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: {
                    message : 'No existe un hospital con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalDeleted
        });
        

    });

});


module.exports = app;

