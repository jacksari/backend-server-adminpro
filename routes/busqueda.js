var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var reg = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, reg),
            buscarMedicos(busqueda, reg),
            buscarUsuario(busqueda, reg)
        ])
        .then(resp => {
            res.status(200).json({
                ok: true,
                hospitales: resp[0],
                medicos: resp[1],
                usuarios: resp[2]
            })
        })
});

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var reg = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla;

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuario(busqueda, reg);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, reg);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, reg);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });

    }

    promesa.then(resp => {
        res.status(200).json({
            [tabla]: resp,
            ok: true
        })
    })




});


function buscarHospitales(busqueda, reg) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: reg })
            .populate('usuario', 'nombre apellidos email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales)
                }
            });
    });
}

function buscarMedicos(busqueda, reg) {

    return new Promise((resolve, reject) => {

        Medico.find()
            .populate('usuario', 'nombre apellidos email')
            .populate('hospital', 'nombre direccion estado')
            .or([{ 'nombre': reg }, { 'apellidos': reg }])
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos)
                }
            });
    });
}

function buscarUsuario(busqueda, reg) {

    return new Promise((resolve, reject) => {

        Usuario.find()
            .or([{ 'nombre': reg }, { 'apellidos': reg }, { 'email': reg }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios')
                } else {
                    resolve(usuarios)
                }
            })
    });
}

module.exports = app;