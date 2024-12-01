require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');  
const estacionamentoRoutes = require('./routes/estacionamentoRoutes');

const app = express();

const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
};

app.use(cors(corsOptions)); 


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/api/estacionamentos', estacionamentoRoutes);

const vagaSchema = new mongoose.Schema({
    numero: Number,
    status: { type: String, enum: ['Disponível', 'Ocupada'], default: 'Disponível' },
    placa: { type: String, required: false, unique: true },
    hora_entrada: { type: Date, required: false },
});

const Vaga = mongoose.models.Vaga || mongoose.model('Vaga', vagaSchema);

console.log('Mongo URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB', err));

async function inicializarVagas() {
    console.log("Verificando se há vagas disponíveis...");
    const vagasExistentes = await Vaga.countDocuments({ status: 'Disponível' });

    console.log(`Vagas existentes: ${vagasExistentes}`);

    if (vagasExistentes === 0) {
        console.log('Não há vagas disponíveis. Criando novas vagas...');

        
        const vagas = [];
        for (let i = 1; i <= 10; i++) {
            const vaga = {
                numero: i,  
                status: 'Disponível',
                placa: null,  
                hora_entrada: null
            };
            vagas.push(vaga);
}


        try {
            const result = await Vaga.insertMany(vagas);
            console.log('Vagas criadas com sucesso:', result);
        } catch (err) {
            console.error('Erro ao criar vagas:', err);
        }
    } else {
        console.log(`${vagasExistentes} vagas disponíveis.`);
    }
}

mongoose.connection.once('open', async () => {
    console.log('Banco de dados conectado.');
    await inicializarVagas(); 
});

app.post('/api/estacionamentos/entrada', async (req, res) => {
    const vagasDisponiveis = await Vaga.countDocuments({ status: 'Disponível' });
    if (vagasDisponiveis === 0) {
        return res.status(400).json({ error: 'Não há vagas disponíveis' });
    }

    const { placa } = req.body;

    if (!placa) {
        return res.status(400).json({ error: "Placa do veículo é necessária" });
    }

    try {
        const vagaDisponivel = await Vaga.findOne({ status: 'Disponível' });

        if (!vagaDisponivel) {
            return res.status(400).json({ error: "Não há vagas disponíveis" });
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

        res.status(200).json({ message: "Entrada registrada com sucesso", vaga: vagaDisponivel });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao registrar a entrada" });
    }
});


app.get('/api/estacionamentos', async (req, res) => {
    console.log('Requisição recebida em /api/estacionamentos');
    try {
        const vagas = await Vaga.find();
        console.log('Vagas retornadas:', vagas);
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
