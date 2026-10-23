import logoutIcon from '@/assets/icons/logout-sidebar.svg';

type UserCardProps = {
  name: string;
  role: string;
  onLogout: () => void;
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';

  return `${first}${last}`.toUpperCase();
}

export function UserCard({ name, role, onLogout }: UserCardProps) {
  return (
    <div className="user-card">
      <span className="user-card__avatar" aria-hidden="true">
        {getInitials(name)}
      </span>
      <span className="user-card__info">
        <span className="user-card__name">{name}</span>
        <span className="user-card__role">{role}</span>
      </span>
      <button type="button" className="admin-icon-button" aria-label="Sair" onClick={onLogout}>
        <img src={logoutIcon} alt="" width={18} height={18} />
      </button>
    </div>
  );
}
