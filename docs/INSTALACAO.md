# Instalação e execução

## Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`;
- pnpm instalado globalmente (`npm install -g pnpm`), se não estiver disponível;
- Navegador com WebGL;
- Git somente para a alternativa de clonagem.

O projeto usa `pnpm-lock.yaml`. Prefira pnpm para reproduzir as versões já validadas.

## Ambiente de desenvolvimento

Na raiz do projeto:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abra o endereço informado pelo Vite. Para interromper o servidor, use `Ctrl+C` no terminal.

## Build de produção

```bash
pnpm build
pnpm preview
```

O build gera `dist/`, que é ignorada pelo Git por ser um artefato reproduzível.

## Verificação local

```bash
pnpm check:geometry
```

Esse comando confere as relações geométricas configuradas para o percurso de um carro virtual. Ele não acessa hardware nem exige Wi-Fi.

## Computador do SENAI

### Alternativa A — clonar pelo GitHub

1. Instale Node.js compatível e pnpm.
2. Abra PowerShell ou Prompt de Comando na pasta onde o projeto ficará.
3. Execute:

   ```bash
   git clone <URL-DO-REPOSITORIO>
   cd shopping-mawrl
   pnpm install --frozen-lockfile
   pnpm dev
   ```

4. Abra no navegador a URL mostrada pelo Vite.

Essa alternativa exige acesso ao repositório privado e internet apenas para clonar e instalar dependências.

### Alternativa B — levar uma versão compilada

No computador em que o projeto está preparado:

```bash
pnpm build
```

Copie para uma mídia ou pasta de apresentação:

```text
dist/
scripts/serve-dist.mjs
scripts/iniciar-dist.cmd
```

No computador do SENAI, instale Node.js compatível. Clique duas vezes em `scripts/iniciar-dist.cmd` ou execute-o pelo Prompt de Comando. O script verifica a presença de `dist/index.html`, inicia um servidor HTTP local e informa o endereço, normalmente `http://127.0.0.1:4173`.

Não abra `dist/index.html` diretamente por duplo clique. O Vite gera uma aplicação que deve ser entregue por um servidor HTTP, mesmo em uso local.

Para encerrar o servidor, mantenha a janela aberta e pressione `Ctrl+C`.
