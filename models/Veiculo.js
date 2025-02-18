const mongoose = require('mongoose');

const VeiculoSchema = new mongoose.Schema({
    placa: { 
        type: String, 
        required: true, 
        match: /^[A-Z]{3}-\d{4}$/ 
    },
    modelo: { type: String, required: true },
    cor: { type: String, required: true },
    vaga_ocupada: { type: Number, required: true },
    hora_entrada: { type: Date, default: Date.now },
});

VeiculoSchema.methods.isParked = function() {
    return this.vaga_ocupada !== null; 
};

VeiculoSchema.statics.findByPlaca = function(placa) {
    return this.findOne({ placa });
};

module.exports = mongoose.model('Veiculo', VeiculoSchema);