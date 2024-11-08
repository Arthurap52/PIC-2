const mongoose = require('mongoose');

const vagaSchema = new mongoose.Schema({
    numero_vaga: { type: Number, required: true, unique: true },
    ocupada: { type: Boolean, default: false },
    placa_veiculo: { type: String, default: null },
    hora_entrada: { type: Date, default: null }
});

const Vaga = mongoose.model('Vaga', vagaSchema);
module.exports = Vaga;
