var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El	nombre	es	necesario'] },
    direccion: { type: String, required: false, default: 'Sin dirección' },
    img: { type: String, required: false },
    estado: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'usuario' }
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);