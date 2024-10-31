document.getElementById('form-veiculo').addEventListener('submit', async function (e) {
    e.preventDefault();
    const placa = document.getElementById('placa').value;
  
    const response = await fetch('http://localhost:3000/entrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placa })
    });
  
    if (response.ok) {
      alert('Veículo registrado com sucesso!');
      atualizarVagas();
    } else {
      alert('Erro ao registrar veículo.');
    }
  });
  
  async function atualizarVagas() {
    const response = await fetch('http://localhost:3000/vagas');
    const vagas = await response.json();
  
    const listaVagas = document.getElementById('lista-vagas');
    listaVagas.innerHTML = '';
  
    vagas.forEach(vaga => {
      const li = document.createElement('li');
      li.textContent = `${vaga.placa} - Entrada: ${vaga.entrada}`;
      listaVagas.appendChild(li);
    });
  }
  
  atualizarVagas();
  