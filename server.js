require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const vagaSchema = new mongoose.Schema({
  numero: Number,
  status: String,
});

const Vaga = mongoose.model('Vaga', vagaSchema);

console.log('Mongo URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB', err));

app.post('/api/estacionamentos', async (req, res) => {
    const { placa } = req.body;
    if (!placa) {
        return res.status(400).json({ message: 'Placa é obrigatória' });
    }

    try {
       
        const novaVaga = new Vaga({
            numero: Math.floor(Math.random() * 100), // Exemplo de número aleatório para vaga
            status: 'Ocupada',
        });

        await novaVaga.save();

        const vagas = await Vaga.find();
        res.json(vagas);

    } catch (error) {
        console.error('Erro ao registrar entrada:', error);
        res.status(500).json({ message: 'Erro ao registrar a entrada.' });
    }
});

app.get('/api/estacionamentos', async (req, res) => {
    try {
        const vagas = await Vaga.find();
        res.json(vagas);
    } catch (error) {
        console.error('Erro ao obter as vagas:', error);
        res.status(500).json({ message: 'Erro ao obter as vagas.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
