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

    // A função que faz o envio dos dados para o servidor
    async function enviarDados() {
        const nome = nomeInput.value;
        const telefone = telefoneInput.value;
        const item = itemInput.value;

        // Validação
        if (!nome || !telefone || !item) {
            resultadoP.textContent = "Por favor, preencha todos os campos!";
            resultadoP.style.color = 'orange';
            return;
        }

        const dados = {
            nome: nome,
            telefone: telefone,
            item: item
        };

        // URLs do seu servidor
        const urlCadastrar = 'https://sitecha1.onrender.com/cadastrarItem';
        const urlResposta = 'https://sitecha1.onrender.com/resultado';

        // Tenta primeiro a URL principal de cadastro
        try {
            console.log(`Enviando para: ${urlCadastrar}`);

            const response = await fetch(urlCadastrar, {
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

                // Limpa os campos após o sucesso
                nomeInput.value = '';
                telefoneInput.value = '';
                itemInput.value = '';
                return; // Encerra a função aqui, pois deu tudo certo
            }
        } catch (error) {
            console.log(`Falha em ${urlCadastrar}, tentando alternativa...`, error.message);
        }

        // Se a primeira URL falhar (por qualquer motivo), tenta a segunda
        try {
            console.log(`Enviando para: ${urlResposta}`);

            const response = await fetch(urlResposta, {
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

                // Limpa os campos após o sucesso
                nomeInput.value = '';
                telefoneInput.value = '';
                itemInput.value = '';
                return; // Encerra a função aqui, pois deu tudo certo
            }
        } catch (error) {
            console.log(`Falha em ${urlResposta}:`, error.message);
        }

        // Se ambas as tentativas falharem, exibe uma mensagem de erro final
        resultadoP.textContent = "Erro ao conectar com o servidor.";
        resultadoP.style.color = 'red';
    }
});