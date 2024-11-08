const formVeiculo = document.getElementById('form-veiculo');
const placaInput = document.getElementById('placa');
const listaVagas = document.getElementById('lista-vagas');

async function registrarEntrada(event) {
    event.preventDefault();

    const placa = placaInput.value.trim();
    if (placa === '') {
        alert('Por favor, insira uma placa válida.');
        return;
    }

    try {
        const response = await fetch('/api/estacionamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ placa })
        });

        if (!response.ok) {
            throw new Error('Falha ao registrar entrada.');
        }

        const data = await response.json();
        atualizarListaVagas(data);
        placaInput.value = '';  

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao registrar a entrada. Tente novamente.');
    }
}

function atualizarListaVagas(vagas) {
    listaVagas.innerHTML = '';
    vagas.forEach(vaga => {
        const li = document.createElement('li');
        li.textContent = `Vaga ${vaga.numero} - Status: ${vaga.status}`;
        listaVagas.appendChild(li);
    });
}

formVeiculo.addEventListener('submit', registrarEntrada);

async function carregarVagas() {
    try {
        const response = await fetch('/api/estacionamentos');
        const vagas = await response.json();
        atualizarListaVagas(vagas);
    } catch (error) {
        console.error('Erro ao carregar as vagas:', error);
    }
}

window.onload = carregarVagas;
