const mongoose = require('mongoose');

const VeiculoSchema = new mongoose.Schema({
    placa: { type: String, required: true },
    modelo: { type: String, required: true },
    cor: { type: String, required: true },
    vaga_ocupada: { type: Number, required: true },
    hora_entrada: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Veiculo', VeiculoSchema);
