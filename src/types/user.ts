// Apenas dados administrativos da conta. Diário, emoções, contatos e sessões
// nunca fazem parte deste tipo.
export type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  isActive: boolean;
  lastAccess: string | null;
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
  age: number;
  gender: Gender;
  isActive: boolean;
};
