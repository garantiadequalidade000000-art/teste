# Instruções para Configuração da Plataforma PhotoShare

Siga os passos abaixo para configurar sua plataforma com as novas funcionalidades de **Senha**, **Personalização** e **Exclusão de Fotos**.

---

## 1. Configuração do Google Sheets (Banco de Dados)

### Aba Principal (Fotos)
1. Crie uma nova planilha no Google Sheets.
2. Na primeira aba (geralmente chamada "Página1"), adicione estes cabeçalhos na **Linha 1**:
   - **Coluna A**: `eventId` (Código do Evento)
   - **Coluna B**: `imageUrl` (Link da Imagem)
   - **Coluna C**: `userName` (Nome do Convidado)
   - **Coluna D**: `Timestamp` (Data/Hora)
   - **Coluna E**: `password` (Senha do Evento)

### Aba de Configurações (Personalização)
1. Crie uma **segunda aba** na mesma planilha e renomeie-a exatamente para `Configs`.
2. O script gerenciará essa aba automaticamente, mas se quiser criar o cabeçalho, coloque `EventID` em A1 e `JSON_Config` em B1.

---

## 2. Instalação do Script (Backend)
1. Na sua planilha, vá em **Extensões** > **Apps Script**.
2. Apague todo o código existente.
3. Cole o conteúdo do arquivo `backend.gs` que está nesta pasta.
4. Clique no ícone de disquete (Salvar) e dê um nome (ex: `Backend PhotoShare`).
5. Clique em **Implantar** > **Nova implantação**.
6. Selecione o tipo **App da Web**.
7. Configurações:
   - **Descrição**: `Versão 2.0`
   - **Executar como**: `Eu`
   - **Quem pode acessar**: `Qualquer pessoa` (Fundamental para o site funcionar).
8. Clique em **Implantar**, autorize o acesso (Google dirá que o app não é verificado, clique em "Avançado" e "Ir para Backend... (inseguro)").
9. Copie a **URL do App da Web** gerada.

---

## 3. Configuração do Frontend (index.html)
1. Abra o arquivo `index.html`.
2. Procure a linha 601: `const GAS_WEBAPP_URL = '...';`
3. Cole a sua URL entre as aspas.
4. Salve o arquivo.

---

## 4. Novidades e Como Usar

### 🔐 Acesso com Senha
- Ao criar um evento, a senha digitada será a "chave" dele para sempre.
- Convidados só entram se digitarem a senha correta (links compartilhados já trazem a senha embutida).

### 🗑️ Exclusão de Fotos
- Cada convidado pode remover **apenas as próprias fotos**.
- O botão de lixeira só aparece se o nome de quem está logado for o mesmo de quem enviou a foto.

### 🎨 Personalização (Ícone de Engrenagem)
- Agora você pode mudar a cor do site, o fundo e a fonte.
- Clique em **Salvar Alterações** para que todos que acessarem o link vejam a mesma identidade visual.
- O site ajusta automaticamente a cor do texto para garantir legibilidade se você escolher um fundo muito claro.

---

## Cloudinary (Já configurado)
- **Cloud Name**: `dzql3w87i`
- **Upload Preset**: `dados_eventos`
- **Status**: O preset deve estar como **"Unsigned"** nas configurações do Cloudinary.
