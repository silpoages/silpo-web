import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminFooter } from './AdminFooter';
import type { BreadcrumbItem } from './Breadcrumb';
import { findNavItemByPath, type AdminNavCounters } from './navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import './AdminLayout.css';

type AdminLayoutProps = {
  counters?: AdminNavCounters;
  user?: { name: string; role: string };
  documentationUrl?: string;
  onLogout?: () => void;
};

export function AdminLayout({ counters, user, documentationUrl, onLogout }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const sidebarUser =
    user ??
    (authUser ? { name: authUser.full_name ?? authUser.email, role: 'Administrador' } : undefined);
  const currentItem = findNavItemByPath(location.pathname);

  const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Início', path: '/dashboard' }];
  if (currentItem) {
    breadcrumbItems.push({ label: currentItem.label });
  }

  function handleLogout() {
    logout();
    if (onLogout) {
      onLogout();
      return;
    }
    navigate('/');
  }

  return (
    <div className="admin-layout">
      <Sidebar counters={counters} user={sidebarUser} onLogout={handleLogout} />
      <div className="admin-layout__main">
        <Topbar breadcrumbItems={breadcrumbItems} onLogout={handleLogout} />
        <main className="admin-layout__content">
          <Outlet />
        </main>
        <AdminFooter documentationUrl={documentationUrl} />
      </div>
    </div>
  );
}
