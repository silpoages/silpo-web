import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { GENDER_OPTIONS, getAge } from '@/lib/user';
import type { AdminUser, Gender, UserFormValues } from '@/types/user';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_AGE = 13;
const MAX_AGE = 120;

type UserFormModalProps = {
  user?: AdminUser;
  isSaving?: boolean;
  error?: string | null;
  onSubmit: (values: UserFormValues) => void;
  onClose: () => void;
};

type FormErrors = Partial<Record<'name' | 'email' | 'birthDate', string>>;

function validate(name: string, email: string, birthDate: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = 'Informe o nome.';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Informe um e-mail válido.';
  if (birthDate) {
    const age = getAge(birthDate);
    if (Number.isNaN(age) || age < MIN_AGE || age > MAX_AGE) {
      errors.birthDate = `A idade deve ficar entre ${MIN_AGE} e ${MAX_AGE} anos.`;
    }
  }
  return errors;
}

export function UserFormModal({
  user,
  isSaving = false,
  error,
  onSubmit,
  onClose,
}: UserFormModalProps) {
  const isEditing = Boolean(user);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [gender, setGender] = useState<Gender>(user?.gender ?? 'FEMALE');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(name, email, birthDate);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      birthDate: birthDate || null,
      gender,
      isActive,
    });
  }

  return (
    <Modal
      id="user-form"
      title={isEditing ? 'Editar usuário' : 'Novo usuário'}
      description="Contas do aplicativo. Dados sensíveis são tratados com cuidado."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="user-form-fields"
            className="button button--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar usuário'}
          </button>
        </>
      }
    >
      <form id="user-form-fields" className="user-form" noValidate onSubmit={handleSubmit}>
        {error && (
          <p className="users-field__error user-form__full" role="alert">
            {error}
          </p>
        )}
        <label className="users-field user-form__full">
          <span className="users-field__label">Nome</span>
          <input
            className="users-field__control"
            placeholder="Nome completo"
            value={name}
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name && <span className="users-field__error">{errors.name}</span>}
        </label>
        <label className="users-field user-form__full">
          <span className="users-field__label">E-mail</span>
          <input
            type="email"
            className="users-field__control"
            placeholder="usuario@email.com"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && <span className="users-field__error">{errors.email}</span>}
        </label>
        <label className="users-field">
          <span className="users-field__label">Data de nascimento</span>
          <input
            type="date"
            className="users-field__control"
            value={birthDate}
            aria-invalid={Boolean(errors.birthDate)}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          {errors.birthDate && <span className="users-field__error">{errors.birthDate}</span>}
        </label>
        <label className="users-field">
          <span className="users-field__label">Gênero</span>
          <select
            className="users-field__control"
            value={gender}
            onChange={(event) => setGender(event.target.value as Gender)}
          >
            {GENDER_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="users-field user-form__full">
          <span className="users-field__label">Status</span>
          <select
            className="users-field__control"
            value={isActive ? 'active' : 'inactive'}
            onChange={(event) => setIsActive(event.target.value === 'active')}
          >
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>
        </label>
        {!isEditing && (
          <p className="user-form__notice user-form__full">
            A pessoa recebe um e-mail para definir a própria senha.
          </p>
        )}
      </form>
    </Modal>
  );
}
