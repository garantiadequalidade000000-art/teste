/**
 * Função para chamar a API externa de geração de DANFE (NFe/NFCe).
 *
 * Esta função é acionada pelo clique no botão "DANFE" na linha da tabela.
 * Ela depende que:
 * 1. Exista um <input id="apiKeyDanfe"> no HTML para ler a API Key.
 * 2. Exista um array global 'arquivosXML' que armazena objetos contendo
 * { content: '...conteúdo xml...', chave: '...chave de acesso...' }
 *
 * API Endpoint: POST https://consultadanfe.com/CDanfe/api_generate
 *
 * @param {Event} event - O evento do clique (para feedback no botão).
 * @param {string} chave - A chave de acesso da NFe/NFCe passada pelo 'onclick'.
 */
async function gerarDanfeAPI(event, chave) {
    // Previne qualquer comportamento padrão do botão
    if (event) event.preventDefault();

    // 1. Obter a API Key do campo de input
    const apiKey = document.getElementById('apiKeyDanfe').value;
    if (!apiKey || apiKey.trim() === '') {
        alert("Por favor, insira sua 'API Key (DANFE)' no campo superior antes de gerar um DANFE.");
        document.getElementById('apiKeyDanfe').focus();
        return;
    }

    // 2. Encontrar o conteúdo XML bruto pela chave
    // (Assumindo que 'arquivosXML' é uma variável global)
    const arquivo = arquivosXML.find(arq => arq.chave === chave);
    
    if (!arquivo || !arquivo.content) {
        alert(`Erro: Não foi possível encontrar o conteúdo XML para a chave ${chave}. Tente recarregar os arquivos.`);
        return;
    }

    const xmlContent = arquivo.content;
    const apiUrl = 'https://consultadanfe.com/CDanfe/api_generate';
    
    // 3. Mudar o status do botão (Feedback visual para o usuário)
    const button = event.target;
    button.disabled = true;
    button.innerText = 'Gerando...';

    try {
        // 4. Montar o payload (Corpo da Requisição)
        // (ASSUMINDO que a API espera um JSON com 'api_key' e 'xml_content')
        const payload = {
            "api_key": apiKey,
            "xml_content": xmlContent
        };

        // 5. Fazer a chamada POST usando fetch
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 6. Tratar a resposta
        if (!response.ok) {
            // Se a resposta HTTP não for OK (ex: 404, 500)
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // 7. Processar a resposta JSON da API
        // (ASSUMINDO que a API retorna { "success": true, "pdf_base64": "..." })
        if (data.success && data.pdf_base64) {
            
            // Decodifica o Base64 e força o download do PDF
            const byteCharacters = atob(data.pdf_base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Cria um link temporário para o download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `DANFE_${chave}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
        } else {
            // Se a API retornar sucesso=false ou um erro conhecido
            throw new Error(data.error || "A API não retornou um PDF válido.");
        }

    } catch (error) {
        // Captura erros de rede ou da lógica de tratamento
        console.error("Erro ao gerar DANFE:", error);
        alert(`Falha ao gerar o DANFE: \n${error.message}`);
    } finally {
        // 8. Restaurar o botão, independente de sucesso ou falha
        button.disabled = false;
        button.innerText = 'DANFE';
    }
}
