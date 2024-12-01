const express = require('express');
const router = express.Router();
const Vaga = require('../models/Vaga');
const Veiculo = require('../models/Veiculo');
const estacionamentoController = require('../controllers/estacionamentoController');


const authMiddleware = (req, res, next) => {
    req.user = { role: 'dono' }; 
    next();
};

router.post('/entrada', async (req, res) => {
    console.log('Requisição recebida:', req.body);
    const { placa } = req.body;

    if (!placa) {
        console.log('Placa não fornecida');
        return res.status(400).json({ error: 'Placa é obrigatória' });
    }

    try {
        const vagaDisponivel = await Vaga.findOne({ status: 'Disponível' });

        if (!vagaDisponivel) {
            return res.status(400).json({ error: 'Não há vagas disponíveis' });
        }

        const novoVeiculo = new Veiculo({
            placa,
            hora_entrada: new Date(),
            vaga_ocupada: vagaDisponivel.numero_vaga
        });

        await novoVeiculo.save();

        vagaDisponivel.status = 'Ocupada';
        vagaDisponivel.placa_veiculo = placa;
        vagaDisponivel.hora_entrada = new Date();
        await vagaDisponivel.save();

        res.status(200).json({ message: 'Entrada registrada com sucesso', vaga: vagaDisponivel });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar entrada' });
    }
});


module.exports = router;
