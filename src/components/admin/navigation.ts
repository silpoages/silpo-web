import dailyMessagesIcon from '@/assets/icons/daily-messages.svg';
import dashboardIcon from '@/assets/icons/dashboard.svg';
import goodPracticesIcon from '@/assets/icons/good-practices.svg';
import meditationsIcon from '@/assets/icons/meditations.svg';
import usersIcon from '@/assets/icons/users.svg';

export type AdminNavKey = 'dashboard' | 'goodPractices' | 'dailyMessages' | 'meditations' | 'users';

export type AdminNavItem = {
  key: AdminNavKey;
  label: string;
  path: string;
  icon: string;
};

export type AdminNavSection = {
  id: string;
  title: string;
  items: AdminNavItem[];
};

export type AdminNavCounters = Partial<Record<AdminNavKey, number>>;

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: 'overview',
    title: 'Visão geral',
    items: [{ key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: dashboardIcon }],
  },
  {
    id: 'app-content',
    title: 'Conteúdo do app',
    items: [
      {
        key: 'goodPractices',
        label: 'Práticas do Bem',
        path: '/good-practices',
        icon: goodPracticesIcon,
      },
      {
        key: 'dailyMessages',
        label: 'Mensagens diárias',
        path: '/daily-messages',
        icon: dailyMessagesIcon,
      },
      { key: 'meditations', label: 'Meditações', path: '/meditations', icon: meditationsIcon },
    ],
  },
  {
    id: 'people',
    title: 'Pessoas',
    items: [{ key: 'users', label: 'Usuários', path: '/users', icon: usersIcon }],
  },
];

export function findNavItemByPath(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
}
