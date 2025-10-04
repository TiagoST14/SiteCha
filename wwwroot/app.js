document.addEventListener("DOMContentLoaded", () => {
    const nomeInput = document.querySelector("#nome");
    const telefoneInput = document.querySelector("#telefone");
    const itemInput = document.querySelector('#item');
    const botao = document.querySelector("#botao");
    const resultadoP = document.querySelector("#resultado");
    const form = document.querySelector("#meuForm");

    // Se existe formulário, previne o comportamento padrão
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // IMPEDE a submissão tradicional
            enviarDados();
        });
    } else {
        // Se não há formulário, usa o clique do botão
        botao.addEventListener("click", enviarDados);
    }
    async function carregarItens() {
        const response = await fetch('/presentesDisponiveis');
        const itens = await response.json();

        const selectElement = document.getElementById('item');
        selectElement.innerHTML = '<option value="">Escolha o item</option>';

        itens.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            // AJUSTE AQUI: de 'nomeDoPresente' para 'nome'
            option.textContent = item.nome;
            selectElement.appendChild(option);
        });
    }

    carregarItens();

    // A função que faz o envio dos dados para o servidor
    async function enviarDados() {
        
        const nomePessoa = nomeInput.value;
        const telefonePessoa = telefoneInput.value;

        
        const selectedIndex = itemInput.selectedIndex;
        const presenteNome = itemInput.options[selectedIndex].text;

       
        const presenteIdValue = itemInput.value;

        // 2. Validação
        if (!nomePessoa || !telefonePessoa || !presenteIdValue) {
            resultadoP.textContent = "Por favor, preencha todos os campos!";
            resultadoP.style.color = 'orange';
            return;
        }

        //ria o objeto 'escolha' no novo formato, com o nome do presente
        const escolha = {
            presenteNome: presenteNome, // << MUDANÇA AQUI
            nomePessoa: nomePessoa,
            telefonePessoa: telefonePessoa
        };

        try {
            const response = await fetch('/registrarEscolha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(escolha)
            });

            if (response.ok) {
                resultadoP.textContent = `Obrigado, ${nomePessoa}! Seu presente foi registrado com sucesso.`;
                resultadoP.style.color = 'green';

                carregarItens();

                nomeInput.value = '';
                telefoneInput.value = '';
            } else {
                const errorText = await response.text();
                resultadoP.textContent = errorText;
                resultadoP.style.color = 'red';
            }
        } catch (error) {
            resultadoP.textContent = "Erro de conexão com o servidor.";
            resultadoP.style.color = 'red';
        }
    }

});