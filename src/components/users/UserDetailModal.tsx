import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/date';
import { formatAge, GENDER_LABELS, getAge, getDisplayName } from '@/lib/user';
import type { AdminUser } from '@/types/user';

type UserDetailModalProps = {
  user: AdminUser;
  onEdit: (id: string) => void;
  onClose: () => void;
};

export function UserDetailModal({ user, onEdit, onClose }: UserDetailModalProps) {
  const details = [
    { label: 'E-mail', value: user.email },
    { label: 'Idade', value: user.birthDate ? formatAge(getAge(user.birthDate)) : '—' },
    { label: 'Gênero', value: GENDER_LABELS[user.gender] },
    { label: 'Cadastrado em', value: formatDate(user.createdAt) },
  ];

  return (
    <Modal
      id="user-detail"
      title={getDisplayName(user)}
      description="Somente dados administrativos da conta."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--secondary" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="button button--primary" onClick={() => onEdit(user.id)}>
            Editar
          </button>
        </>
      }
    >
      <dl className="user-detail">
        <div className="user-detail__item">
          <dt>Status</dt>
          <dd>
            <StatusBadge isActive={user.isActive} />
          </dd>
        </div>
        {details.map((detail) => (
          <div key={detail.label} className="user-detail__item">
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
      <p className="user-detail__notice">
        Diário, emoções, contatos e sessões são privados e não ficam disponíveis no painel.
      </p>
    </Modal>
  );
}
