import logoutIcon from '@/assets/icons/logout-topbar.svg';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

type TopbarProps = {
  breadcrumbItems: BreadcrumbItem[];
  onLogout: () => void;
};

export function Topbar({ breadcrumbItems, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <Breadcrumb items={breadcrumbItems} />
      <div className="topbar__actions">
        <button type="button" className="admin-icon-button" aria-label="Sair" onClick={onLogout}>
          <img src={logoutIcon} alt="" width={19} height={19} />
        </button>
      </div>
    </header>
  );
}
