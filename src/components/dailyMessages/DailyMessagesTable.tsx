import editIcon from '@/assets/icons/edit.svg';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Toggle } from '@/components/ui/Toggle';
import { formatDate } from '@/lib/date';
import type { DailyMessage } from '@/types/dailyMessage';

type DailyMessagesTableProps = {
  messages: DailyMessage[];
  onToggle: (id: string, isEnabled: boolean) => void;
  onEdit: (id: string) => void;
};

export function DailyMessagesTable({ messages, onToggle, onEdit }: DailyMessagesTableProps) {
  return (
    <table className="daily-messages-table">
      <thead>
        <tr>
          <th scope="col" className="daily-messages-table__message">
            Mensagem
          </th>
          <th scope="col">Última exibição</th>
          <th scope="col">Status</th>
          <th scope="col">Ativa</th>
          <th scope="col">
            <span className="visually-hidden">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {messages.map((dailyMessage) => (
          <tr key={dailyMessage.id}>
            <td className="daily-messages-table__message">{dailyMessage.message}</td>
            <td className="daily-messages-table__muted">
              {dailyMessage.lastShown ? formatDate(dailyMessage.lastShown) : '—'}
            </td>
            <td>
              <StatusBadge isActive={dailyMessage.enabled} />
            </td>
            <td>
              <Toggle
                isChecked={dailyMessage.enabled}
                label={`Mensagem ativa: ${dailyMessage.message}`}
                onChange={(isChecked) => onToggle(dailyMessage.id, isChecked)}
              />
            </td>
            <td className="daily-messages-table__actions">
              <button
                type="button"
                className="daily-messages-table__edit"
                aria-label={`Editar mensagem: ${dailyMessage.message}`}
                onClick={() => onEdit(dailyMessage.id)}
              >
                <img src={editIcon} alt="" width={16} height={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
