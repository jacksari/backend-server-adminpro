var express = require('express');
const _ = require('underscore');

var app = express();

var Medico = require('../models/medico');

var mdAutenticacion = require('../middlewares/autenticacion').verificaToken;


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 1;
    desde = Number(desde);

    Medico.find({})
        .skip(desde - 1)
        .limit(5)
        .populate('usuario', 'nombre apellidos email')
        .populate('hospital', 'nombre direccion estado')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        erros: err
                    });
                }
                Medico.countDocuments({}, (err, conteo) => {
                    res.json({
                        ok: true,
                        medicos,
                        cuantos: conteo
                    });
                });
            })
});

app.post('/', mdAutenticacion, (req, res) => {
    let body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        apellidos: body.apellidos,
        usuario: req.usuario._id,
        estado: body.estado,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                erros: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

app.put('/:id', mdAutenticacion, (req, res) => {
    var id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'apellidos', 'hospital', 'estado']);
    body.usuario = req.usuario._id;
    Medico.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, medicoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                erros: { message: 'No existe un medico con ese ID' }
            });
        }
        res.json({
            ok: true,
            medico: medicoDB
        })
    });
});

app.delete('/:id', mdAutenticacion, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                erros: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                erros: { message: 'No existe un medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});


module.exports = app;