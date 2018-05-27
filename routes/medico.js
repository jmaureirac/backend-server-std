var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');


// *****************************************
//      Obtener todos los medicos
// *****************************************
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)   
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, cantidad) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: cantidad     
                    });
                    
                });
            }
        );

});


// *****************************************
//      Obtener medico por id
// *****************************************
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec( (err, medico) => {

            if( err ) {
                return res.status(500).json({
                   ok: false,
                   mensaje: 'Error al cargar medico',
                   errors: err
               });
            }
            
            if( !medico ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico inexistente',
                    errors: {
                        message: 'No existe medico con ese id'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });
            

        });

});


// *****************************************
//      Insertar un medico
// *****************************************
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoSaved) => {

        if( err ) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al crear medico',
               errors: err
           });
        }
        
        res.status(201).json({
            ok: true,
            medico: medicoSaved
        });
        
        

    });

});


// *****************************************
//      Actualizar un medico
// *****************************************
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medico) => {

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
                mensaje: `El medico con el id ${ id } no existe`,
                errors: {
                    message : 'No existe un medico con ese id'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoSaved) => {

            if( err ) {
                return res.status(400).json({
                   ok: false,
                   mensaje: 'Error al actualizar el medico',
                   errors: err
               });
            }
            
            res.status(200).json({
                ok: true,
                medico: medicoSaved
            });
            
        });
    });

});


// *****************************************
//      Eliminar un medico
// *****************************************
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDeleted) => {

        if( err ) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al eliminar el medico',
               errors: err
           });
        }
        
        if( !medicoDeleted ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: {
                    message : 'No existe un medico con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoDeleted
        });
        

    });

});





module.exports = app;
