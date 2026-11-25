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

Abre em `http://localhost:3000` (mesma URL do `WEB_APP_URL` padrão do backend).

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

## Estrutura

```
src/
├── assets/       # imagens e outros arquivos estáticos
├── components/   # UI reutilizável
├── hooks/        # hooks customizados
├── lib/          # helpers puros, sem estado
├── pages/        # telas / rotas
├── services/     # chamadas à API
└── types/        # tipos TypeScript compartilhados
```

## Testes

Testes ficam ao lado do arquivo que testam (ex.: `src/pages/Dashboard/Dashboard.test.tsx`), usando
[Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/react).

```bash
npm run test
```

### Cobertura de testes

```bash
npm run test:coverage
npm run coverage:summary
```

A coleta usa o V8 e mede linhas, instruções, funções e ramificações de todo o código
TypeScript em `src/`, inclusive arquivos não importados pelos testes. Apenas arquivos de
teste, declarações de tipos (`.d.ts`) e o setup dos testes ficam fora da medição.

- `coverage/index.html`: relatório navegável por arquivo.
- `coverage/coverage-summary.json`: percentuais e contagens por métrica.
- `coverage/lcov.info`: relatório para integração com outras ferramentas.

O CI publica os percentuais no resumo da execução e disponibiliza o artefato
`web-coverage` por 14 dias. Relatórios gerados após falha de testes podem ser parciais;
confira também o resultado do job. Os arquivos gerados não são versionados.

Nesta etapa não há percentual mínimo obrigatório. Cobertura mede código exercitado,
não a porcentagem de testes aprovados nem a ausência de defeitos.

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) roda em todo push e pull request:

- **Lint** — `oxlint` + `prettier --check` + `tsc` (typecheck) + `npm audit`
- **Test** — `vitest run --coverage`, resumo de percentuais e relatórios para download
- **Build** — `vite build` (roda só se `Lint` e `Test` passarem)

## Fluxo de branches

- `develop` — branch padrão, onde o desenvolvimento acontece
- `master` — branch de produção

## Convenções de commit/lint

Antes de cada commit, um hook (Husky) roda automaticamente lint + format nos arquivos alterados.
Se o commit for bloqueado, corrija os erros apontados e tente novamente.
