const mongoose = require('mongoose');

const estacionamentoSchema = new mongoose.Schema({
    endereco: {
        type: String,
        required: true,
        unique: true 
    },
    capacidade: {
        type: Number,
        required: true
    },
    servicos: {
        type: [String],
        default: [] 
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Estacionamento', estacionamentoSchema);
