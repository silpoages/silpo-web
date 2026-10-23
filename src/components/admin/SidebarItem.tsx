import { NavLink } from 'react-router-dom';

type SidebarItemProps = {
  label: string;
  path: string;
  icon: string;
  counter?: number;
};

export function SidebarItem({ label, path, icon, counter }: SidebarItemProps) {
  const iconMask = `url("${icon}")`;

  return (
    <NavLink to={path} className="sidebar-item">
      <span
        className="sidebar-item__icon"
        style={{ maskImage: iconMask, WebkitMaskImage: iconMask }}
        aria-hidden="true"
      />
      <span className="sidebar-item__label">{label}</span>
      {counter !== undefined && (
        <span className="sidebar-item__counter">{counter.toLocaleString('pt-BR')}</span>
      )}
    </NavLink>
  );
}
