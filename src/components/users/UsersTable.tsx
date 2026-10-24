import editIcon from '@/assets/icons/edit.svg';
import trashIcon from '@/assets/icons/trash.svg';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatLastAccess } from '@/lib/date';
import { formatAge, GENDER_LABELS, getInitials } from '@/lib/user';
import type { AdminUser } from '@/types/user';

type UsersTableProps = {
  users: AdminUser[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
};

export function UsersTable({ users, onView, onEdit, onDeactivate }: UsersTableProps) {
  return (
    <table className="users-table">
      <thead>
        <tr>
          <th scope="col">Usuário</th>
          <th scope="col">Idade</th>
          <th scope="col">Gênero</th>
          <th scope="col">Último acesso</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <button
                type="button"
                className="users-table__user"
                aria-label={`Ver detalhes de ${user.name}`}
                onClick={() => onView(user.id)}
              >
                <span className="users-table__avatar" aria-hidden="true">
                  {getInitials(user.name)}
                </span>
                <span className="users-table__identity">
                  <span className="users-table__name">{user.name}</span>
                  <span className="users-table__email">{user.email}</span>
                </span>
              </button>
            </td>
            <td className="users-table__muted">{formatAge(user.age)}</td>
            <td className="users-table__muted">{GENDER_LABELS[user.gender]}</td>
            <td className="users-table__muted">
              {user.lastAccess ? formatLastAccess(user.lastAccess) : '—'}
            </td>
            <td>
              <StatusBadge isActive={user.isActive} />
            </td>
            <td className="users-table__actions">
              <button
                type="button"
                className="users-table__icon-button"
                aria-label={`Editar usuário: ${user.name}`}
                onClick={() => onEdit(user.id)}
              >
                <img src={editIcon} alt="" width={16} height={16} />
              </button>
              <button
                type="button"
                className="users-table__icon-button"
                aria-label={`Desativar usuário: ${user.name}`}
                title={user.isActive ? undefined : 'Usuário já está inativo'}
                disabled={!user.isActive}
                onClick={() => onDeactivate(user.id)}
              >
                <img src={trashIcon} alt="" width={16} height={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
