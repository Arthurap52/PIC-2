const Estacionamento = require('../models/Estacionamento');

exports.registrarEstacionamento = async (req, res) => {
    try {
        if (req.user.role !== 'dono') {
            return res.status(403).json({ message: 'Acesso negado. Apenas o dono pode registrar estacionamentos.' });
        }

        const { endereco, capacidade, servicos } = req.body;

        const estacionamentoExistente = await Estacionamento.findOne({ endereco });
        if (estacionamentoExistente) {
            return res.status(400).json({ message: 'Estacionamento com este endereço já existe.' });
        }

        const novoEstacionamento = new Estacionamento({ endereco, capacidade, servicos });
        await novoEstacionamento.save();

        res.status(201).json({ message: 'Estacionamento registrado com sucesso!', estacionamento: novoEstacionamento });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar estacionamento', error });
    }
};
