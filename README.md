# Mandato Aberto no Twitter

Chatbot para Twitter utilizando o [account-activity-dashboard](https://github.com/twitterdev/account-activity-dashboard) de exemplo do Twitter.
Feito para replicar o mesmo chatbot do [Mandato Aberto](https://github.com/AppCivico/MandatoAberto-chatbot) disponível no Messenger.
Assim como o chatbot para Messenger, os dados de cada usuário inscrito no app são provenientes da [API do Mandato Aberto](https://github.com/AppCivico/MandatoAberto-api) utilizando seu respectivo Twitter ID como identificador.

## Dependencias

* Um ambiente de teste para a [Account Activity API](https://developer.twitter.com/en/apply)
* Um app do Twitter criado em [apps.twitter.com](https://apps.twitter.com/), com acesso a Account Activity API
* [Node.js](https://nodejs.org)
* [ngrok](https://ngrok.com/) ou outro serviço de tunelamento (optional)

## Crie e configure um Twitter app 

1. Crie um Twitter app [apps.twitter.com](https://apps.twitter.com/)

2. Vá em **Permissions** > **Access** > assinale **Read, Write and Access direct messages**.

3. Vá em **Keys and Access Tokens** > **Your Access Token** > clique em **Create my access token**.

4. Vá em **Keys and Access Tokens**, guarde os `consumer key`, `consumer secret`, `access token` e `access token secret` gerados.

## Crie e configure um acesso beta a Account Activity API 

1. Entre em [https://developer.twitter.com/en/apply](https://developer.twitter.com/en/apply))

2. Confirme seu telefone (se necessário).

3. Responda os questionários. Pode escolher "Personal Use". Escreva um texto em inglês explicando porque você quer esse acesso.

4. Confirme seu e-mail e aguarde alguns dias pela resposta do Twitter.

5. Crie um ambiente/environment para seu webhook em: [https://developer.twitter.com/en/account/environments](https://developer.twitter.com/en/account/environments)

6. Configure um ambiente em "Account Activity API Sandbox" (Uma caixa de diálogo aparecerá).

7. Configure o rótulo do ambiente (exemplo: "Teste").

8. Selecione o App que você criou.

## Configure e execute essa aplicação

1. Clone esse repositório

```bash
git clone https://github.com/AppCivico/Twitter-Chatbot.git
```

2. Instale as dependências do Node.js:

```bash
npm install
```

3. Crie um novo arquivo `config.json` baseado no `config.sample.json` e preencha as chaves e tokens do seu App e o nome do ambiente do seu webhook (exemplo: TWITTER_WEBHOOK_ENV:"Teste"). As chaves e tokens de acesoo do seu App podem ser encontradas em [apps.twitter.com](https://apps.twitter.com/). USER e PASSWORD podem ser o que você quiser, e são usadas como uma simples proteção por senha para a interface web de configuração.

4. Execute localmente (por padrão, ele utilizará a porta 5000):

```bash
npm start
```

5. Configure um túnel ao localhost com [ngrok](https://ngrok.com/) ou similar.

```bash
./ngrok http 5000
```

Guarde a URL do seu webhook. Por exemplo:

```text
https://9eb889bb.ngrok.io
```

6. Com essa URL, revisite seu App, vá em **Settings**, e adicione as seguintes URLs como URLS de callback permitidas (Não esqueça de salvar as mudanças com "Update Settings" na parte de baixo):

```text
https://9eb889bb.ngrok.io/callbacks/addsub
https://9eb889bb.ngrok.io/callbacks/removesub
```

## Configure seu webhook para receber eventos

Para configurar seu webhook você pode usar a interface web do aplicativo ou os scripts de exemplo da linha de comando. Deixe o servidor Express rodando para tudo funcione.

### Usando os scripts de exemplo

Esses scripts devem ser executados da raiz da pasta do seu projeto. Seu ambiente, url ou webhook devem ser passado como argumentos na linha de comando.

1. Criar a configuração do webhook.

```bash
node example_scripts/webhook_management/create-webhook-config.js -e <ambiente> -u <url>
```

Onde <ambiente> é o rótulo do webhook(e.g. "Teste") e <url> é a url do seu webhook + /webhook/twitter. 
Importante: nesse projeto, o [arquivo responsável] já inclui a parte do '/webhook/twitter'm então você só precisa de:
```bash
node example_scripts/webhook_management/create-webhook-config.js -e Teste -u https://9eb889bb.ngrok.io
```

**Obs:** para adicionar um novo webhook será necessário deletar o antigo primeiro com:
```bash
node example_scripts/webhook_management/delete-webhook-config.js -e <ambiente>
```

2. Adicione uma inscrição do aplicativo para o usuário dono do aplicativo (você?). No acesso gratuito ao Account Activity API o limite é de 15 inscrições.

```bash
node example_scripts/subscription_management/add-subscription-app-owner.js -e <ambiente>
```

3. Para adicionar a inscrição de um usuário qualquer utilize o login baseado em PIN com o seguinte comando:

```bash
node example_scripts/subscription_management/add-subscription-other-user.js -e <ambiente>
```
Mande o link para o usuário, ele deverá logar-se e te devolver o PIN. Entre com o PIN no terminal e anote os access_token e access_token secret para registrar no oauth.

**Note:** Mais scripts podem sem encontrados em [example_scripts](example_scripts), incluindo:

* Criar, deletar, visualizar e validar a configuração do webhook.
* Adicionar, remover, visualizar, contar e listar inscrições dos.

### Usando a interface web

Carregue a interface no seu navegador (localhost:5000) e siga as instruções abaixo:

1. Configuração do webhook. Navegue para "manage webhook". Entre sua URL do webhook e clique em "Create/Update."

2. Adicione um usuário. Navegue até "manage subscriptions". Clique em "add" e siga com o Login do Twitter. Assim que completa seu webhook irá começar a receber os eventos da atividade da conta do usuário.

## Oauth?

Cada usuário precisa de sua própria autenticação para que esse chatbot possa agir em seu nome. Ao realizar a inscrição do usuário (com o PIN, por exemplo) o access_token e o access_token secret serão usados para autenticação. No caso, eles são vinculados a um Twitter ID. A classe responsável é a [auth-other-user.js](https://github.com/AppCivico/Twitter-Chatbot/blob/master/helpers/auth-other-user.js). 

## Mensagem de Boas-Vindas?

Foi escrito um [script](https://github.com/AppCivico/Twitter-Chatbot/blob/master/example_scripts/misc/create-welcome-message.js) para ajudar nessa questão. O que ele faz é apagar todas as mensagens e regras que o usuário já tem e carregar o novo texto da API já criando a regra e configurando essa mensagem como ativa. Execute-o da seguinte maneira: 

```bash
node example_scripts/misc/create-welcome-message.js -t <ID>
```

Sendo <ID> o Twitter ID do usuário.

