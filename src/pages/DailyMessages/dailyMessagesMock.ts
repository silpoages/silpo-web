import type { DailyMessage } from '@/types/dailyMessage';

// Dados temporários até a integração com GET /admin/daily-messages.
export const DAILY_MESSAGES_MOCK: DailyMessage[] = [
  {
    id: '1',
    message: 'Você não precisa dar conta de tudo hoje. Só do próximo passo.',
    enabled: true,
    lastShown: '2026-08-19T12:00:00Z',
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: '2',
    message: 'Sentir muita coisa ao mesmo tempo também é uma resposta legítima.',
    enabled: true,
    lastShown: '2026-08-18T12:00:00Z',
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: '3',
    message: 'Descanso não é recompensa por produtividade. É necessidade.',
    enabled: true,
    lastShown: '2026-08-17T12:00:00Z',
    createdAt: '2026-07-02T12:00:00Z',
  },
  {
    id: '4',
    message: 'Reparar no que está indo bem exige tanto treino quanto reparar no que dói.',
    enabled: false,
    lastShown: null,
    createdAt: '2026-07-03T12:00:00Z',
  },
  {
    id: '5',
    message: 'Um dia difícil não apaga o progresso das últimas semanas.',
    enabled: true,
    lastShown: '2026-08-16T12:00:00Z',
    createdAt: '2026-07-04T12:00:00Z',
  },
  {
    id: '6',
    message: 'Pedir ajuda encurta caminho. Não é atalho, é bom senso.',
    enabled: false,
    lastShown: null,
    createdAt: '2026-07-05T12:00:00Z',
  },
  {
    id: '7',
    message: 'Respirar fundo antes de responder também é uma resposta.',
    enabled: true,
    lastShown: '2026-08-15T12:00:00Z',
    createdAt: '2026-07-06T12:00:00Z',
  },
  {
    id: '8',
    message: 'Pequenos passos repetidos viram grandes caminhos.',
    enabled: true,
    lastShown: '2026-08-14T12:00:00Z',
    createdAt: '2026-07-07T12:00:00Z',
  },
  {
    id: '9',
    message: 'Você pode recomeçar quantas vezes precisar.',
    enabled: true,
    lastShown: '2026-08-13T12:00:00Z',
    createdAt: '2026-07-08T12:00:00Z',
  },
  {
    id: '10',
    message: 'Nem todo dia precisa ser produtivo para ter valor.',
    enabled: false,
    lastShown: '2026-08-01T12:00:00Z',
    createdAt: '2026-07-09T12:00:00Z',
  },
  {
    id: '11',
    message: 'Cuidar de si não é egoísmo, é manutenção.',
    enabled: true,
    lastShown: '2026-08-12T12:00:00Z',
    createdAt: '2026-07-10T12:00:00Z',
  },
  {
    id: '12',
    message: 'O que você sente hoje não define quem você é amanhã.',
    enabled: true,
    lastShown: null,
    createdAt: '2026-07-11T12:00:00Z',
  },
];
