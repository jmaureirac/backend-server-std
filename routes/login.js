var express = require('express');
var brcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


var app = express();
var Usuario = require('../models/usuario');

var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// *****************************************
//      Autenticación de Google
// *****************************************

/* jshint ignore:start */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };

}


app.post('/google', async(req, res) => {

    var token = req.body.token;
    
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Token inválido'
            });
        });

    
        Usuario.findOne( {email: googleUser.email }, (err, usuarioDB) => {
            if( err ) {
                return res.status(500).json({
                   ok: false,
                   mensaje: 'Error al buscar usuario',
                   errors: err
               });
            }
            if( usuarioDB ) {
                if( usuarioDB.googleUser === false ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No puede autenticarse con google',
                        errors: err
                    });
                } else {
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                }
            } else {
                // Usuario inexistente, crear

                var usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)';

                usuario.save( (err, usuarioSaved) => {
                    if( err ) {
                        return res.status(500).json({
                           ok: false,
                           mensaje: 'Error al guardar usuario',
                           errors: err
                       });
                    }
                    
                    var token = jwt.sign({ usuario: usuarioSaved }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioSaved,
                        token: token,
                        id: usuarioSaved._id
                    });


                })
                

            }


        });


    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!',
    //     googleUser: googleUser
    // });
    

});
/* jshint ignore:end */


// *****************************************
//      Autenticación normal
// *****************************************
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if( !brcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear Token
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
        
    });

});



module.exports = app;