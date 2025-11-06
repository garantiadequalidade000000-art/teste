/**
 * Gera os DANFEs para as NF-e (Mod. 55) carregadas,
 * chamando uma API externa e compactando os PDFs resultantes.
 * * Esta função depende das variáveis globais:
 * - arquivosXML: Array com { fileName, content, mod }
 * - notasFiscais: Array com objetos de nota (para filtro de CNPJ)
 * - filterCNPJ: O elemento <select> do filtro de CNPJ
 * - obterNomeFantasiaPrincipal(): Função auxiliar
 * - obterPeriodoEmissaoPrincipal(): Função auxiliar
 * * E das bibliotecas:
 * - JSZip
 */
async function gerarDanfes() {
    if (arquivosXML.length === 0) {
        alert("Nenhum arquivo XML foi carregado.");
        return;
    }

    const danfeButton = document.getElementById('danfeButton');
    danfeButton.disabled = true;
    danfeButton.textContent = '📄 Gerando... (0%)';

    // --- 1. Filtrar Arquivos ---
    const modFilter = '55'; // Apenas NF-e
    const cnpjFilter = filterCNPJ.value;
    
    const arquivosFiltrados = arquivosXML.filter(arq => {
        // Apenas Mod. 55
        if (arq.mod !== modFilter) return false;
        
        // Se o filtro for 'ALL', não precisa checar CNPJ
        if (cnpjFilter === 'ALL') return true;

        // Tenta encontrar a nota fiscal correspondente para verificar o CNPJ
        // (Lógica reutilizada de compactarEBaixarXML)
        const nota = notasFiscais.find(n => n.chave === arq.content.match(/<chNFe>(\d+)<\/chNFe>|<chNFCE>(\d+)<\/chNFCE>/)?.[1] || n.chave === arq.content.match(/<chNFe>(\d+)<\/chNFe>|<chNFCE>(\d+)<\/chNFCE>/)?.[2]);
        
        let matchesCNPJ = true;
        if (nota && nota.cnpj !== cnpjFilter) {
            matchesCNPJ = false;
        }
        
        if (!nota) {
             // Tenta extrair o CNPJ do XML bruto
             const cnpjMatch = arq.content.match(/<CNPJ>(\d+)<\/CNPJ>/);
             if (cnpjMatch && cnpjMatch[1] !== cnpjFilter) {
                 matchesCNPJ = false;
             } else if (!cnpjMatch && cnpjFilter !== 'ALL') {
                 // Se não tem nota e não achou CNPJ no XML, e o filtro não é ALL, melhor ignorar.
                 matchesCNPJ = false; 
             }
        }
        
        return matchesCNPJ;
    });

    if (arquivosFiltrados.length === 0) {
        const cnpjText = cnpjFilter !== 'ALL' ? ` para o CNPJ ${cnpjFilter}` : '';
        alert(`Nenhuma NF-e (Mod. 55)${cnpjText} foi encontrada para gerar DANFE.`);
        danfeButton.disabled = false;
        danfeButton.textContent = '📄 Gerar DANFEs (NF-e)';
        return;
    }
    
    // --- 2. Preparar ZIP e API ---
    const zip = new JSZip();
    const apiURL = 'https://consultadanfe.com/CDanfe/api_generate';
    let arquivosProcessados = 0;
    const totalArquivos = arquivosFiltrados.length;

    try {
        const promessas = arquivosFiltrados.map(async (arq) => {
            try {
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        // Assumindo que a API espera o XML bruto.
                        'Content-Type': 'application/xml' 
                    },
                    body: arq.content
                });

                if (!response.ok) {
                    throw new Error(`API falhou para ${arq.fileName} (Status: ${response.status})`);
                }

                const pdfBlob = await response.blob();
                
                // Define o nome do arquivo PDF
                const safeFileName = arq.fileName.replace(/[^a-zA-Z0-9.\-]/g, '_').replace(/.xml$/i, '.pdf');
                
                // Adiciona o PDF ao ZIP
                zip.file(safeFileName, pdfBlob);

            } catch (error) {
                console.error(`Erro ao processar DANFE para ${arq.fileName}:`, error);
                // Adiciona um log de erros no ZIP
                zip.file(`ERRO_${arq.fileName}.txt`, `Não foi possível gerar o DANFE. Motivo: ${error.message}`);
            } finally {
                // Atualiza o progresso
                arquivosProcessados++;
                const percent = Math.round((arquivosProcessados / totalArquivos) * 100);
                danfeButton.textContent = `📄 Gerando... (${percent}%)`;
            }
        });

        // Espera todas as chamadas de API terminarem
        await Promise.all(promessas);

        // --- 3. Gerar e Baixar o ZIP ---
        danfeButton.textContent = '📦 Compactando...';
        const content = await zip.generateAsync({ type: "blob" });

        // Define o nome do arquivo ZIP
        let nomeArquivoZip;
        if (cnpjFilter === 'ALL') {
            const periodoEmissao = obterPeriodoEmissaoPrincipal(); 
            nomeArquivoZip = `DANFEs-NFe-Todos-CNPJs-${periodoEmissao}.zip`;
        } else {
            const nomeFantasiaPrincipal = obterNomeFantasiaPrincipal();
            const periodoEmissao = obterPeriodoEmissaoPrincipal();
            nomeArquivoZip = `DANFEs-NFe-${nomeFantasiaPrincipal}-${periodoEmissao}_${cnpjFilter}.zip`;
        }

        // Força o download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = nomeArquivoZip;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        alert(`Download do arquivo "${nomeArquivoZip}" iniciado com sucesso.`);

    } catch (error) {
        console.error("Erro ao gerar ou baixar o arquivo ZIP de DANFEs:", error);
        alert("Ocorreu um erro ao tentar gerar e baixar os DANFEs. Verifique o console para mais detalhes.");
    } finally {
        // Restaura o botão
        danfeButton.disabled = false;
        danfeButton.textContent = '📄 Gerar DANFEs (NF-e)';
    }
}
