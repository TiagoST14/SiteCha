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

    // Tenta primeiro a URL principal
    const UrlCadastrar = 'http://localhost:5000/cadastrarItem';
    const UrlResposta = 'http://localhost:5000/resultado';

    try {
        console.log(`Enviando para: ${UrlCadastrar}`);

        const response = await fetch(UrlCadastrar, {
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

            nomeInput.value = '';
            telefoneInput.value = '';
            itemInput.value = '';
            return;
        }
    } catch (error) {
        console.log(`Falha em ${UrlCadastrar}, tentando alternativa...`);
    }

    // Se falhar, tenta a URL alternativa
    try {
        console.log(`Enviando para: ${UrlResposta}`);

        const response = await fetch(UrlResposta, {
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

            nomeInput.value = '';
            telefoneInput.value = '';
            itemInput.value = '';
            return;
        }
    } catch (error) {
        console.log(`Falha em ${UrlResposta}:`, error.message);
    }

    resultadoP.textContent = "Erro ao conectar com o servidor.";
    resultadoP.style.color = 'red';
}