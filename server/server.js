const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

let vagas = [];

// Carrega dados do arquivo JSON
fs.readFile('./server/database.json', 'utf-8', (err, data) => {
  if (!err) vagas = JSON.parse(data);
});

// Rota para registrar entrada
app.post('/entrada', (req, res) => {
  const { placa } = req.body;
  const entrada = new Date().toISOString();

  vagas.push({ placa, entrada });
  fs.writeFile('./server/database.json', JSON.stringify(vagas), () => {});

  res.status(201).send(' Novo Veículo registrado.');
});

// Rota para listar vagas
app.get('/vagas', (req, res) => {
  res.json(vagas);
});

app.listen(PORT, () => console.log(` O Servidor esta rodando em http://localhost:${PORT}`));