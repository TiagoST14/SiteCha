document.addEventListener("DOMContentLoaded", () => {
    const nomeInput = document.querySelector("#nome");
    const telefoneInput = document.querySelector("#telefone");
    const itemInput = document.querySelector('#item');
    const botao = document.querySelector("#botao");
    const resultadoP = document.querySelector("#resultado");
    const form = document.querySelector("#meuForm"); // seleciona o formulário se existir

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

    async function enviarDados() {
        const nome = nomeInput.value;
        const telefone = telefoneInput.value;
        const item = itemInput.value;

        // URLs possíveis do seu servidor C#
        const urls = [
            'http://localhost:5123/contatos',
            'http://localhost:5123/resultado',
            'http://localhost:5123/cadastrarItem'
            
        ];

        const dados = {
            nome: nome,
            telefone: telefone,
            item: item
        };

        // Validação
        if (!nome || !telefone || !item) {
            resultadoP.textContent = "Por favor, preencha todos os campos!";
            resultadoP.style.color = 'orange';
            return;
        }

        let success = false;

        for (const url of urls) {
            try {
                console.log(`Tentando: ${url}`);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dados)
                });

                console.log(`Resposta: ${response.status}`);

                if (response.ok) {
                    const dataCriada = await response.json();
                    resultadoP.textContent = `Produto "${dataCriada.item}" cadastrado com sucesso! (ID: ${dataCriada.nome})`;
                    resultadoP.style.color = 'green';

                    // Limpa os campos
                    nomeInput.value = '';
                    telefoneInput.value = '';
                    itemInput.value = '';

                    success = true;
                    break;
                }
            } catch (error) {
                console.log(`Falha em ${url}:`, error.message);
                continue;
            }
        }

        if (!success) {
            resultadoP.textContent = "Erro ao conectar com o servidor.";
            resultadoP.style.color = 'red';
        }
    }
});