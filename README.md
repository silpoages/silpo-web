# silpo-web

Painel administrativo web do projeto Silpo (AGES — PUCRS).

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build tool e dev server
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) — linter
- [Prettier](https://prettier.io/) — formatação de código
- [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) — lint/format automático antes de cada commit

## Requisitos

- Node.js **>= 22.12** (a versão exata usada no projeto está em [`.nvmrc`](./.nvmrc))
  - Se usa [nvm](https://github.com/nvm-sh/nvm) ou [nvm-windows](https://github.com/coreybutler/nvm-windows): `nvm use`

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Variáveis de ambiente

Copie [`.env.example`](./.env.example) para `.env` e ajuste os valores se necessário.

## Scripts disponíveis

| Comando                | O que faz                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | sobe o servidor de desenvolvimento                               |
| `npm run build`        | build de produção (`tsc` + `vite build`)                         |
| `npm run preview`      | serve o build de produção localmente, pra testar antes de deploy |
| `npm run lint`         | roda o linter (oxlint)                                           |
| `npm run format`       | formata todo o código com Prettier                               |
| `npm run format:check` | só verifica formatação, sem alterar arquivos (útil em CI)        |

## Fluxo de branches

- `develop` — branch padrão, onde o desenvolvimento acontece
- `master` — branch de produção

## Convenções de commit/lint

Antes de cada commit, um hook (Husky) roda automaticamente lint + format nos arquivos alterados.
Se o commit for bloqueado, corrija os erros apontados e tente novamente.
