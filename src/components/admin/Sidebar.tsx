import leafIcon from '@/assets/icons/leaf.svg';
import { ADMIN_NAV_SECTIONS, type AdminNavCounters } from './navigation';
import { SidebarItem } from './SidebarItem';
import { UserCard } from './UserCard';

type SidebarProps = {
  counters?: AdminNavCounters;
  user?: { name: string; role: string };
  onLogout: () => void;
};

export function Sidebar({ counters = {}, user, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand" aria-label="Silpo, painel administrativo">
        <span className="sidebar__leaf-mark" aria-hidden="true">
          <img src={leafIcon} alt="" width={16.5} height={16.5} />
        </span>
        <span className="sidebar__wording">
          <strong>Silpo</strong>
          <span>ADMIN</span>
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Navegação principal">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.id} className="sidebar__section">
            <p id={`sidebar-section-${section.id}`} className="sidebar__section-title">
              {section.title}
            </p>
            <ul className="sidebar__list" aria-labelledby={`sidebar-section-${section.id}`}>
              {section.items.map((item) => (
                <li key={item.key}>
                  <SidebarItem
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    counter={counters[item.key]}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && <UserCard name={user.name} role={user.role} onLogout={onLogout} />}
    </aside>
  );
}
