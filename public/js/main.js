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

function editarVeiculo(idVeiculo) {
    const novaVaga = prompt('Digite o número da nova vaga:');
    if (!novaVaga) return;

    fetch(`${API_BASE_URL}/veiculos/${idVeiculo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaga_ocupada: novaVaga })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao editar veículo: ${response.statusText}`);
        }
        return response.json();
    })
    .then(() => {
        carregarVagas(); 
        carregarVeiculos(); 
        alert('Veículo editado com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao editar o veículo:', error);
        alert('Erro ao editar o veículo.');
    });
}


function excluirVeiculo(veiculoId) {
    const confirmar = confirm('Tem certeza que deseja excluir este veículo?');
    if (!confirmar) return;  
    fetch(`${API_BASE_URL}/veiculo/${veiculoId}`, {  
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(() => {
        console.log('Veículo excluído com sucesso');
        carregarVeiculos();  
    })
    .catch(error => {
        console.error('Erro ao excluir veículo:', error);
    });
}

function atualizarVagaNaTela(vaga) {
    const listaVagas = document.getElementById('lista-vagas');
    if (!listaVagas) {
        console.error('Elemento listaVagas não encontrado');
        return;
    }

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

function criarElementoVeiculo(veiculo) {
    const li = document.createElement('li');
    li.classList.add('veiculo-item');
    li.innerHTML = `
        <span>${veiculo.placa}</span>
        <span>Vaga ${veiculo.vaga_ocupada}</span>
        <span>Entrada: ${new Date(veiculo.hora_entrada).toLocaleString()}</span>
        <button class="editar-veiculo" data-id="${veiculo._id}">Editar</button>
        <button class="excluir-veiculo" data-id="${veiculo._id}">Excluir</button>
    `;

    const editarButton = li.querySelector('.editar-veiculo');
    const excluirButton = li.querySelector('.excluir-veiculo');

    editarButton.addEventListener('click', function() {
        editarVeiculo(veiculo._id);
    });

    excluirButton.addEventListener('click', function() {
        excluirVeiculo(veiculo._id);
    });

    return li; 
}

function carregarVeiculos() {
    const listaVeiculos = document.getElementById('lista-veiculos');
    listaVeiculos.innerHTML = ''; 
    fetch(API_BASE_URL + '/veiculos')
        .then(response => response.json())
        .then(veiculos => {
            veiculos.forEach(veiculo => {
                const veiculoElement = criarElementoVeiculo(veiculo); 
                listaVeiculos.appendChild(veiculoElement); 
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os veículos:', error);
            alert('Erro ao carregar veículos.');
        });
}

function criarElementoVaga(vaga) {
    return `
        <li>
            Vaga ${vaga.numero_vaga}: ${vaga.status} 
            ${vaga.placa_veiculo ? `| Placa: ${vaga.placa_veiculo}` : ''}
        </li>
    `;
}

const carregarVagas = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Erro ao carregar vagas: ${response.statusText}`);
        }
        const vagas = await response.json();

        const vagasDisponiveis = vagas.filter(vaga => vaga.status === 'Disponível').length;
        
        document.getElementById('vagas-disponiveis').innerText = `${vagasDisponiveis} vagas disponíveis`;
    } catch (error) {
        console.error('Erro ao carregar as vagas:', error);
        document.getElementById('vagas-disponiveis').innerText = 'Erro ao carregar vagas';
    }
};

formVeiculo.addEventListener('submit', registrarEntrada);

window.onload = () => {
    carregarVagas(); 
    carregarVeiculos(); 
};
