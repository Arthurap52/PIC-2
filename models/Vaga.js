const mongoose = require('mongoose');

const vagaSchema = new mongoose.Schema({
    numero_vaga: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Disponível', 'Ocupada'] 
    },
    placa_veiculo: String,
    hora_entrada: Date
});


const Vaga = mongoose.model('Vaga', vagaSchema);

module.exports = Vaga;
