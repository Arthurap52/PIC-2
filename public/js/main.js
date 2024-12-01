const API_BASE_URL = 'http://localhost:3000/api/estacionamentos';
const formVeiculo = document.getElementById('form-veiculo');
const placaInput = document.getElementById('placa');
const listaVagas = document.getElementById('lista-vagas');

function registrarEntrada(event) {
    event.preventDefault();
  
    const placa = placaInput.value; 
    if (!placa) {
        console.error('Placa não fornecida');
        return;
    }

    fetch('http://localhost:3000/api/estacionamentos/entrada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placa: placa })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Erro ao registrar entrada:', data.error);
        } else {
            console.log('Entrada registrada com sucesso:', data);
            atualizarVagaNaTela(data.vaga);  
        }
    })
    .catch(error => console.error('Erro ao registrar entrada:', error));
}

function atualizarVagaNaTela(vaga) {
    const vagaElement = document.querySelector(`#vaga-${vaga.numero_vaga}`);
    if (vagaElement) {
        vagaElement.textContent = `Vaga ${vaga.numero_vaga}: ${vaga.status}`;
    } else {
        const novaVaga = document.createElement('li');
        novaVaga.id = `vaga-${vaga.numero_vaga}`;
        novaVaga.textContent = `Vaga ${vaga.numero_vaga}: ${vaga.status}`;
        listaVagas.appendChild(novaVaga);
    }
}

const carregarVagas = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Erro ao carregar vagas: ${response.statusText}`);
        }
        const vagas = await response.json();

        listaVagas.innerHTML = vagas.map(vaga => `
            <li id="vaga-${vaga.numero_vaga}">Vaga ${vaga.numero_vaga}: ${vaga.status}</li>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar as vagas:', error);
    }
};

formVeiculo.addEventListener('submit', registrarEntrada);

window.onload = carregarVagas;
