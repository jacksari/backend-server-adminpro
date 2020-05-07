var express = require('express');
const _ = require('underscore');

var app = express();

var Hospital = require('../models/hospital');

var mdAutenticacion = require('../middlewares/autenticacion').verificaToken;


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 1;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde - 1)
        .limit(5)
        .populate('usuario', 'nombre apellidos email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        erros: err
                    });
                }

                Hospital.countDocuments({}, (err, conteo) => {
                    res.json({
                        ok: true,
                        hospitales,
                        cuantos: conteo
                    });
                });


            })
});

app.post('/', mdAutenticacion, (req, res) => {

    let body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        direccion: body.direccion,
        estado: body.estado,
        usuario: req.usuario._id,
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                erros: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

app.put('/:id', mdAutenticacion, (req, res) => {
    var id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'direccion', 'img', 'estado']);
    body.usuario = req.usuario._id;
    Hospital.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, hospitalDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                erros: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.json({
            ok: true,
            hospital: hospitalDB
        })
    });
});

app.delete('/:id', mdAutenticacion, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                erros: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                erros: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});






module.exports = app;