# Sentinela IA — passo a passo para publicar (só pelo navegador)

Você vai precisar de: um computador com Chrome ou Edge, uma conta no **GitHub** e uma conta na **Vercel** (as duas são grátis). A chave da Anthropic é opcional: sem ela, o site funciona no **modo demonstração**.

## 1. Descompactar

1. Clique com o botão direito em `sentinela-ia.zip` e escolha **Extrair tudo**.
2. Abra a pasta que foi criada. Lá dentro você deve ver **exatamente** isto:
   `api` (pasta), `index.html`, `package.json`, `vercel.json`, `robots.txt`, `favicon.svg`, `dev-server.js`, `LEIA-ME.md`.

## 2. Subir no GitHub

1. Em github.com, clique em **+ › New repository**.
2. Nome: `sentinela-ia`. Marque **Public** ou **Private**. **Não** marque "Add a README". Clique em **Create repository**.
3. Na página do repositório vazio, clique no link **uploading an existing file**.
4. Na pasta do passo 1, aperte **Ctrl + A** para selecionar **tudo o que está dentro dela** e **arraste** para a página do GitHub.
   - Arraste o **conteúdo** da pasta, não a pasta inteira. Este é o erro que causou o 404.
   - Use arrastar, não o botão "choose your files": o botão não envia a pasta `api`.
5. Espere a lista terminar de carregar e clique em **Commit changes**.
6. Confira: a primeira tela do repositório deve mostrar `api`, `index.html`, `package.json` e `vercel.json` **soltos**, sem nenhuma pasta por fora.

## 3. Publicar na Vercel

1. Em vercel.com, entre com a conta do GitHub.
2. Clique em **Add New… › Project** e, ao lado de `sentinela-ia`, clique em **Import**.
   - Se o repositório não aparecer, clique em **Adjust GitHub App Permissions** e libere o acesso a ele.
3. Na tela de configuração:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (não mexa)
   - Abra **Environment Variables** e adicione:
     **Key:** `ANTHROPIC_API_KEY` · **Value:** a sua chave (de console.anthropic.com).
     Sem chave, pule este item: o site abre no modo demonstração.
4. Clique em **Deploy** e espere 1 minuto.
5. Clique em **Continue to Dashboard › Visit**. Tem que aparecer a esfera.

## 4. Conferir

- Abra `https://SEU-PROJETO.vercel.app/api/status`:
  - `{"ok":true,"ia":true}`: a IA está ligada.
  - `{"ok":true,"ia":false}`: falta a chave. Vá em **Settings › Environment Variables**, adicione `ANTHROPIC_API_KEY`, e depois em **Deployments › ⋯ › Redeploy**.
- Na página, toque na esfera e permita o microfone. Ela diz "Olá, tudo bem? Qual empresa você quer ver?". Responda, por exemplo, "Nubank".
- Depois disso, chame por **"Sentinela"** antes de cada pedido. Exemplo: "Sentinela, e a Microsoft?".

## 5. Aparecer no Google (opcional)

1. Em search.google.com/search-console, clique em **Adicionar propriedade › Prefixo do URL** e cole o endereço do site.
2. Confirme a propriedade pelo método **Tag HTML**: o Google mostra uma linha `<meta …>`. No GitHub, abra `index.html`, clique no lápis (editar), cole essa linha logo abaixo de `<title>Sentinela IA</title>` e clique em **Commit changes**. A Vercel publica sozinha; depois volte ao Google e clique em **Verificar**.
3. Em **Inspeção de URL**, cole o endereço do site e clique em **Solicitar indexação**.

## Se algo der errado

- **404 NOT_FOUND:** os arquivos estão dentro de uma pasta no GitHub. Apague o repositório e refaça o passo 2, arrastando só o conteúdo. Outra saída: em **Settings › Build and Deployment › Root Directory**, coloque o nome da pasta e faça **Redeploy**.
- **A página fala "o servidor da IA não está ativo":** o site foi publicado sem a pasta `api`. Refaça o passo 2 arrastando, não clicando.
- **O microfone não abre:** use o Chrome, o Edge ou o Safari, fora de apps como Instagram e WhatsApp, e permita o microfone no cadeado da barra de endereço.

## Custos

- GitHub e Vercel: grátis.
- IA (só com chave): estimativa de US$ 0,10 a 0,20 por pesquisa de empresa e menos de 1 centavo por pergunta. Defina um limite de gasto no painel da Anthropic.
