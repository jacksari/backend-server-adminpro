var express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion').verificaToken;

var app = express();

var Usuario = require('../models/usuario');

app.get('/', (req, res, next) => {

    Usuario.find({ estado: true }, 'nombre apellidos email img role estado')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargadno usuarios',
                        erros: err
                    });
                }
                Usuario.countDocuments({ estado: true }, (err, conteo) => {
                    res.json({
                        ok: true,
                        usuarios,
                        cuantos: conteo
                    });
                });
            })
});



app.post('/', mdAutenticacion, (req, res) => {

    let body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        apellidos: body.apellidos,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                erros: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});

app.put('/:id', mdAutenticacion, (req, res) => {
    var id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'apellidos', 'email', 'img', 'role', 'estado']);
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                erros: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});

app.delete('/:id', mdAutenticacion, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar usuario',
                erros: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                erros: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});





module.exports = app;