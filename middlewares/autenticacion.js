var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//Verificar token
let verificaToken = (req, res, next) => {

    let token = req.get('token'); // header
    jwt.verify(token, SEED, (err, decode) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decode.usuario;
        next();
    })
};



module.exports = {
    verificaToken,
}