document.addEventListener("DOMContentLoaded", () => {
    const nomeInput = document.querySelector("#nome");
    const telefoneInput = document.querySelector("#telefone");
    const itemInput = document.querySelector('#item');
    const botao = document.querySelector("#botao");
    const resultadoP = document.querySelector("#resultado");
    const form = document.querySelector("#meuForm");

   
    const loadingOverlay = document.querySelector("#loading-overlay");

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            enviarDados();
        });
    } else {
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
            option.textContent = item.nome;
            selectElement.appendChild(option);
        });
    }

    carregarItens();

    async function enviarDados() {

        const nomePessoa = nomeInput.value;
        const telefonePessoa = telefoneInput.value;
        const selectedIndex = itemInput.selectedIndex;
        const presenteNome = itemInput.options[selectedIndex].text;
        const presenteIdValue = itemInput.value;

        if (!nomePessoa || !telefonePessoa || !presenteIdValue) {
            resultadoP.textContent = "Por favor, preencha todos os campos!";
            resultadoP.style.color = 'orange';
            return;
        }

        
        
        
        loadingOverlay.classList.remove('loader-hidden');
        botao.disabled = true;
        resultadoP.textContent = '';
        await new Promise(resolve => setTimeout(resolve, 2000));
        const escolha = {
            presenteNome: presenteNome,
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
                itemInput.value = ''; 
            } else {
                const errorText = await response.text();
                resultadoP.textContent = errorText;
                resultadoP.style.color = 'red';
            }
        } catch (error) {
            resultadoP.textContent = "Erro de conexão com o servidor.";
            resultadoP.style.color = 'red';
        } finally {
            
            loadingOverlay.classList.add('loader-hidden');
            botao.disabled = false;
        }
    }
});