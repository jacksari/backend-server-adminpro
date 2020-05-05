//Requires
var express = require('express');
var mongoose = require('mongoose');




//Inicializar variable
var app = express();


//Conección a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})



//Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        mensaje: 'Petición realizada correctamente',
        ok: true
    })

});



//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});