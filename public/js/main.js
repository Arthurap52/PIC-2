const API_BASE_URL = 'http://localhost:3000/api/estacionamentos';
const formVeiculo = document.getElementById('form-veiculo');
const placaInput = document.getElementById('placa');
const corInput = document.getElementById('cor'); 
const modeloInput = document.getElementById('modelo'); 
const listaVagas = document.getElementById('lista-vagas');
const modal = document.getElementById("meuModal");
const btnFechar = document.getElementById("btnFechar");

let idVeiculoEdicao = null;
let todasAsVagas = [];
let vagasOcupadas = []; 

function abrirModal(placa, cor, modelo, id) {
    document.getElementById('placaModal').value = placa;
    document.getElementById('corModal').value = cor;
    document.getElementById('modeloModal').value = modelo;
    idVeiculoEdicao = id; 
    modal.style.display = "block";
}

function fecharModal() {
    modal.style.display = "none";
}

btnFechar.onclick = fecharModal;

window.onclick = function(event) {
    if (event.target === modal) {
        fecharModal();
    }
};

function registrarEntrada(event) {
    event.preventDefault();

    const placa = placaInput.value; 
    const cor = corInput.value;
    const modelo = modeloInput.value;

    if (!placa || !cor || !modelo) {
        console.error('Placa, cor e modelo são obrigatórios');
        return;
    }

    fetch(`${API_BASE_URL}/entrada`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placa, cor, modelo })
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

function carregarVagasOcupadas() {
    fetch(`${API_BASE_URL}/veiculos`)
        .then(response => response.json())
        .then(veiculos => {
            vagasOcupadas = veiculos.map(veiculo => veiculo.vaga_ocupada);
            preencherSelectVagas(); 
        })
        .catch(error => console.error('Erro ao carregar veículos:', error));
}

function preencherSelectVagas() {
    const vagaSelect = document.getElementById('vagaModal');
    vagaSelect.innerHTML = '<option value="">Selecione uma vaga</option>';

    todasAsVagas.forEach(vaga => {
        if (vaga.status === 'Disponível' && !vagasOcupadas.includes(vaga.numero_vaga)) {
            const option = document.createElement('option');
            option.value = vaga.numero_vaga;
            option.textContent = `Vaga ${vaga.numero_vaga}`;
            vagaSelect.appendChild(option);
        }
    });
}

console.log('Todas as Vagas:', todasAsVagas);
console.log('Vagas Ocupadas:', vagasOcupadas);

async function editarVeiculo() {
    const placa = document.getElementById('placaModal').value;
    const cor = document.getElementById('corModal').value;
    const modelo = document.getElementById('modeloModal').value;
    const vaga_ocupada = document.getElementById('vagaModal').value;

    if (!placa || !cor || !modelo || !vaga_ocupada) {
        alert('Todos os campos devem ser preenchidos.');
        return;
    }

    if (vagasOcupadas.includes(parseInt(vaga_ocupada))) {
        alert("A vaga selecionada já está ocupada. Por favor, escolha outra vaga.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/veiculos/${idVeiculoEdicao}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placa, cor, modelo, vaga_ocupada })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao editar veículo: ${errorData.error || response.statusText}`);
        }

        alert('Veículo editado com sucesso!');
        fecharModal();
        carregarVeiculos(); 
    } catch (error) {
        console.error('Erro ao editar o veículo:', error);
        alert('Erro ao editar o veículo. Verifique o console para mais detalhes.');
    }
}

carregarVagasOcupadas();

document.getElementById('formVeiculo').onsubmit = function(event) {
    event.preventDefault(); 
    editarVeiculo();  
};

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
    const vagaElement = document.getElementById(`vaga-${vaga.numero_vaga}`);
    
    if (vagaElement) {
        vagaElement.textContent = `Vaga ${vaga.numero_vaga}: Ocupada`;
    } else {
        const novaVaga = document.createElement('li');
        novaVaga.id = `vaga-${vaga.numero_vaga}`;
        novaVaga.textContent = `Vaga ${vaga.numero_vaga}: Ocupada`;
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
        abrirModal(veiculo.placa, veiculo.cor, veiculo.modelo, veiculo._id); 
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

async function carregarVagas() {
    try {
        const veiculosResponse = await fetch(`${API_BASE_URL}/veiculos`);
        if (!veiculosResponse.ok) throw new Error('Erro ao carregar veículos');
        const veiculos = await veiculosResponse.json();
  
        vagasOcupadas = veiculos
            .filter(veiculo => veiculo.vaga_ocupada !== null)
            .map(veiculo => veiculo.vaga_ocupada);
        console.log('Vagas Ocupadas Atualizadas:', vagasOcupadas);

        const response = await fetch(`${API_BASE_URL}/vagas`);
        if (!response.ok) throw new Error('Erro ao carregar vagas');
        todasAsVagas = await response.json();

        preencherSelectVagas();
        atualizarContadorVagasDisponiveis();
    } catch (error) {
        console.error('Erro ao carregar vagas:', error);
    }
}

function atualizarContadorVagasDisponiveis() {
    const vagasDisponiveis = todasAsVagas.filter(vaga => 
        vaga.status === 'Disponível' && !vagasOcupadas.includes(vaga.numero_vaga)
    ).length;
    
    document.getElementById('numero-vagas-disponiveis').textContent = vagasDisponiveis;
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-veiculo').addEventListener('submit', registrarEntrada);
});

window.onload = async () => {
    await carregarVagas(); 
    carregarVeiculos();    
};


