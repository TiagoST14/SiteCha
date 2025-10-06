document.addEventListener("DOMContentLoaded", () => {
    const nomeInput = document.querySelector("#nome");
    const telefoneInput = document.querySelector("#telefone");
    const itemInput = document.querySelector('#item');
    const botao = document.querySelector("#botao");
    const resultadoP = document.querySelector("#resultado");

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

            resultadoP.textContent = "Por favor, preencha todos os campos!";
            resultadoP.style.color = 'orange';
            return;
        }

        };

        try {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                resultadoP.style.color = 'green';

                nomeInput.value = '';
                telefoneInput.value = '';
            }
        } catch (error) {
            resultadoP.style.color = 'red';
        }
});