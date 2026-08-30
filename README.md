# silpo-web

Painel administrativo web do projeto Silpo (AGES — PUCRS).

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build tool e dev server
- [React Router](https://reactrouter.com/) — roteamento
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) — linter
- [Prettier](https://prettier.io/) — formatação de código
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/react) — testes
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
| `npm run typecheck`    | roda o `tsc` sem emitir arquivos, só verificando tipos           |
| `npm run test`         | roda a suíte de testes uma vez (útil em CI)                      |
| `npm run test:watch`   | roda os testes em modo watch, pra desenvolvimento local          |

## Testes

Testes ficam ao lado do arquivo que testam (ex.: `src/pages/Dashboard.test.tsx`), usando
[Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/react).

```bash
npm run test
```

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) roda em todo push e pull request:

- **Lint** — `oxlint` + `prettier --check` + `tsc` (typecheck) + `npm audit`
- **Test** — `vitest run`
- **Build** — `vite build` (roda só se `Lint` e `Test` passarem)

Pra travar merge de fato nisso, adicione os três como status checks obrigatórios na proteção de
branch do repositório.

## Fluxo de branches

- `develop` — branch padrão, onde o desenvolvimento acontece
- `master` — branch de produção

## Convenções de commit/lint

Antes de cada commit, um hook (Husky) roda automaticamente lint + format nos arquivos alterados.
Se o commit for bloqueado, corrija os erros apontados e tente novamente.
