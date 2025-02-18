const mongoose = require('mongoose');

const vagaSchema = new mongoose.Schema({
    numero_vaga: {
        type: Number,
        required: true,
        unique: true, 
        min: 1 
    },
    status: {
        type: String,
        required: true,
        enum: ['Disponível', 'Ocupada'] 
    },
    placa_veiculo: String,
    hora_entrada: Date
});

vagaSchema.methods.isAvailable = function() {
    return this.status === 'Disponível';
};

vagaSchema.statics.findAvailable = function() {
    return this.find({ status: 'Disponível' });
};

const Vaga = mongoose.model('Vaga', vagaSchema);

module.exports = Vaga;