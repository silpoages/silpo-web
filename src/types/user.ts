// Apenas dados administrativos da conta. Diário, emoções, contatos e sessões
// nunca fazem parte deste tipo.
export type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type AdminUser = {
  id: string;
  // Contas que ainda não concluíram o onboarding no app não têm nome nem nascimento.
  name: string | null;
  email: string;
  birthDate: string | null;
  gender: Gender;
  isActive: boolean;
  createdAt: string;
};

export type UserStatusFilter = 'all' | 'active' | 'inactive';

export type UserGenderFilter = 'all' | Gender;

export type UserFilters = {
  status: UserStatusFilter;
  gender: UserGenderFilter;
};

export type UserFormValues = {
  name: string;
  email: string;
  birthDate: string | null;
  gender: Gender;
  isActive: boolean;
};
