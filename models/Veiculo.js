const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
    placa: { type: String, required: true, unique: true },
    hora_entrada: { type: Date, required: true },
    hora_saida: { type: Date, default: null },
    vaga_ocupada: { type: Number, required: true }
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);
module.exports = Veiculo;
