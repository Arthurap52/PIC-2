const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;

app.use(express.json());

const uri = 'mongodb://localhost:27017'; // Ajuste se usar o Atlas
const client = new MongoClient(uri);
let collection;

async function conectarDB() {
  await client.connect();
  const db = client.db('estacionamento');
  collection = db.collection('vagas');
  console.log('Conectado ao MongoDB');
}
conectarDB();

app.post('/entrada', async (req, res) => {
  const { placa } = req.body;
  const entrada = new Date().toISOString();

  await collection.insertOne({ placa, entrada });
  res.status(201).send('Veículo registrado.');
});

app.get('/vagas', async (req, res) => {
  const vagas = await collection.find().toArray();
  res.json(vagas);
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
