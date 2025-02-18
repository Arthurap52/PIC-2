const mongoose = require('mongoose');

const estacionamentoSchema = new mongoose.Schema({
    endereco: {
        type: String,
        required: true,
        unique: true,
        index: true 
    },
    capacidade: {
        type: Number,
        required: true,
        min: 1 
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

estacionamentoSchema.methods.isFull = function() {
    return this.capacidade <= 0; 
};

estacionamentoSchema.statics.findByService = function(service) {
    return this.find({ servicos: service });
};

module.exports = mongoose.model('Estacionamento', estacionamentoSchema);