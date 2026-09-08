export interface UserAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  uf: string;
  cep: string;
}

export interface Account {
  subscription: {
    status: 'active' | 'incomplete' | 'past_due' | 'canceled' | 'trialing' | null;
    blocked: boolean;
  };
  ai: {
    available_credits: number;
  };
  features: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
cpf?: string;
  role?: string;
  role_name?: string;
  role_id?: string;
  permissions: string[];
  crmv?: string;
  specialty?: string;
  phone?: string;
  address?: UserAddress;
  hospital_id?: string;
  account?: Account;
}

export interface TeamMember {
  id: string;
  name: string;
  crmv?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message?: string;
  checkout_url?: string | null;
}

export interface RefreshResponse {
  access_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  cpf: string;
  password: string;
  crmv?: string;
  specialty?: string;
  invite_token?: string;
  trial_token?: string;
  plan_id?: string;
  hospital_name?: string;
  hospital_phone?: string;
  cnpj?: string;
  address?: {
    zip_code: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  responsible?: {
    name: string;
    crmv: string;
  };
}
