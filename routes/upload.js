var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleecion
    var tiposVal = ['hospitales', 'medicos', 'usuarios'];
    if (tiposVal.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            erros: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            erros: { message: 'Debe de seleecionar una imagen' }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos
    var extensionesVal = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesVal.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            erros: { message: 'Las extensiones válidas son: ' + extensionesVal.join(', ') }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    //Mpver el archivo de un temporal a un path
    var path = `./uploads/${ tipo}/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                erros: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    })

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuarioDB) => {
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ID inválido de usuario',
                    erros: { message: 'Error al mandar ID' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuarioDB.img;
            //Si exite elimina la imagen anterior
            //console.log('pathviejo', pathViejo);
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            //console.log('123123');
            usuarioDB.img = nombreArchivo;
            usuarioDB.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    mensaje: 'Imagen de usuario actualizada',
                    ok: true,
                    Usuario: usuarioActualizado
                });
            })
        })
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospitalDB) => {
            if (!hospitalDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ID inválido de hospital',
                    erros: { message: 'Error al mandar ID' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospitalDB.img;
            //Si exite elimina la imagen anterior
            //console.log('pathviejo', pathViejo);
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            //console.log('123123');
            hospitalDB.img = nombreArchivo;
            hospitalDB.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    mensaje: 'Imagen de hospital actualizada',
                    ok: true,
                    hospital: hospitalActualizado
                });
            })
        })
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medicoDB) => {
            if (!medicoDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ID inválido de médico',
                    erros: { message: 'Error al mandar ID' }
                });
            }
            var pathViejo = './uploads/medicos/' + medicoDB.img;
            //Si exite elimina la imagen anterior
            //console.log('pathviejo', pathViejo);
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            //console.log('123123');
            medicoDB.img = nombreArchivo;
            medicoDB.save((err, medicoActualizado) => {
                return res.status(200).json({
                    mensaje: 'Imagen de medico actualizada',
                    ok: true,
                    medico: medicoActualizado
                });
            })
        })
    }

}


module.exports = app;