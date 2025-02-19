const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
    placa: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^[A-Z]{3}-\d{4}$/.test(v); 
            },
            message: props => `${props.value} não é uma placa válida!`
        }
    },
    cor: { type: String, required: true },
    modelo: { type: String, required: true },
    hora_entrada: { type: Date, required: true },
    vaga_ocupada: { type: String, required: true }
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);
module.exports = Veiculo;