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

## Estrutura do código

- `src/main.tsx` monta o React e carrega os estilos globais.
- `src/App.tsx` controla a transição entre importação, revisão e exibição da carteirinha.
- `src/pages/` e `src/components/` organizam cada tela e componente em uma pasta com `index.tsx` e seu CSS.
- `src/service/` contém a leitura do PDF, a extração dos campos e a persistência no Cache Storage.
- `src/assets/img/` reúne as imagens. `src/useImage.ts` contém o hook de imagem. `src/constants/` e `src/types/` guardam as coordenadas de recorte e os contratos da carteirinha.
