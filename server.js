require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');  
const estacionamentoRoutes = require('./routes/estacionamentoRoutes');
const Veiculo = require('./models/Veiculo');
const Vaga = require('./models/Vaga');

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
                numero_vaga: i,
                status: 'Disponível',
                placa_veiculo: null,  
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

app.put('/api/estacionamentos/veiculos/:id', async (req, res) => {
    console.log('Requisição recebida para atualizar veículo:', req.body);

    const id = req.params.id;
    const { placa, modelo, cor, vaga_ocupada } = req.body;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
    }

    if (!placa || !modelo || !cor || !vaga_ocupada) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const veiculo = await Veiculo.findByIdAndUpdate(id, { placa, modelo, cor, vaga_ocupada }, { new: true });

        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }

        const vagaAntiga = await Vaga.findOne({ numero_vaga: veiculo.vaga_ocupada });
        if (vagaAntiga) {
            vagaAntiga.status = 'Disponível';
            vagaAntiga.placa_veiculo = null;
            vagaAntiga.hora_entrada = null;
            await vagaAntiga.save();
        }

        const novaVaga = await Vaga.findOne({ numero_vaga: vaga_ocupada });
        if (novaVaga) {
            novaVaga.status = 'Ocupada';
            novaVaga.placa_veiculo = placa;
            novaVaga.hora_entrada = new Date();
            await novaVaga.save();
        }

        res.status(200).json(veiculo);
    } catch (err) {
        console.error('Erro ao atualizar veículo:', err);
        res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
});


app.put('/api/estacionamentos/vagas/:id', async (req, res) => {
    try {
        const vaga = await Vaga.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vaga) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }
        res.status(200).json(vaga);
    } catch (err) {
        console.error('Erro ao atualizar vaga:', err);
        res.status(500).json({ error: 'Erro ao atualizar vaga' });
    }
});


app.delete('/api/estacionamentos/veiculo/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const veiculo = await Veiculo.findByIdAndDelete(id);

        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }

    
        await Vaga.updateOne({ numero_vaga: veiculo.vaga_ocupada }, {
            status: 'Disponível',
            placa_veiculo: null,
            hora_entrada: null
        });

        res.status(200).json({ message: 'Veículo excluído e vaga liberada com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir veículo' });
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

app.get('/api/estacionamentos/veiculos/:id', async (req, res) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        res.json(veiculo);
    } catch (error) {
        console.error('Erro ao obter o veículo:', error);
        res.status(500).json({ message: 'Erro ao obter o veículo.' });
    }
});

app.get('/api/estacionamentos/vagas', async (req, res) => {
    try {
        const vagas = await Vaga.find(); 
        res.json(vagas);
    } catch (error) {
        console.error('Erro ao obter vagas:', error);
        res.status(500).json({ message: 'Erro ao obter vagas.' });
    }
});

app.get('/api/estacionamentos/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find(); 
        res.json(veiculos);
    } catch (error) {
        console.error('Erro ao obter veículos:', error);
        res.status(500).json({ message: 'Erro ao obter veículos.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
