# Identidade Estudantil da UnB · Web

Aplicação React e TypeScript baseada no aplicativo Expo da revisão `f0c8418`. Use Node.js 22 ou mais recente.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Execute os comandos na raiz do repositório. O build estático fica em `dist/` e deve ser servido em HTTPS ou localhost. O worker do PDF.js é incluído no build.

A importação usa a primeira página do PDF e as coordenadas de recorte do aplicativo mobile. O navegador mantém uma carteirinha ativa no Cache Storage, com os campos revisados em texto e a foto e o QR Code criptografados com AES-GCM. O PDF é usado durante a importação e fica fora do cache. A chave AES é gerada no navegador, não exportável e armazenada no IndexedDB. A abertura é automática no mesmo perfil e origem. Registros da versão que exigia frase-senha precisam ser substituídos por uma nova importação. Abas da mesma origem compartilham o registro. Limpar os dados do site remove a carteirinha.

## Uso offline

Abra a versão publicada por HTTPS uma vez com internet e aguarde a página carregar. Depois que o navegador baixar os recursos, o app pode reabrir sem conexão, exibir a carteirinha salva e importar um PDF disponível no aparelho. A instalação na tela inicial é opcional.

O service worker é gerado no build de produção e usa um cache separado para os arquivos do site, incluindo o worker do PDF.js. Para testar localmente, use `npm run build` e `npm run preview`. O servidor de desenvolvimento não instala o service worker.

## Instalação no celular

Abra a versão publicada por HTTPS e toque em **Adicionar à tela inicial** na tela de importação ou no menu da carteirinha. Se aparecer a confirmação do navegador, conclua a instalação por ela. Também é possível instalar pelo menu do navegador:

- **Android (Chrome)** · Menu do navegador → **Instalar e criar atalho** ou **Adicionar à tela inicial** → **Instalar**.
- **iPhone (Safari)** · **Compartilhar** → **Adicionar à Tela de Início**. Se aparecer **Abrir como App da Web**, ative a opção antes de tocar em **Adicionar**.

Toque no ícone **Identidade Estudantil** na tela inicial para abrir o app sem a barra de endereço do navegador. Se o app abrir na tela de importação, importe o PDF nele para salvar a carteirinha nesse ambiente.

## Acesso ao código-fonte

Na tela da carteirinha, abra o menu dos três pontinhos e selecione **Repositório**. Na janela que aparece, selecione **Abrir no GitHub** para acessar o código-fonte em uma nova aba. [Repositório no GitHub](https://github.com/CaioVAzeredo/carteirinha-unb-web)

O aplicativo foi desenvolvido por Caio de Azeredo. O perfil também está disponível em **Sobre o aplicativo**. [GitHub de Caio de Azeredo](https://github.com/CaioVAzeredo)

## Estrutura do código

- `src/main.tsx` monta o React e carrega os estilos globais.
- `src/App.tsx` controla a transição entre importação, revisão e exibição da carteirinha.
- `src/pages/` e `src/components/` organizam cada tela e componente em uma pasta com `index.tsx` e seu CSS.
- `src/service/` contém a leitura do PDF, a extração dos campos e a persistência no Cache Storage.
- `src/assets/img/` reúne as imagens. `src/useImage.ts` contém o hook de imagem. `src/constants/` e `src/types/` guardam as coordenadas de recorte e os contratos da carteirinha.
