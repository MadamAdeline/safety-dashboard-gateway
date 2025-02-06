
export type UserStatus = "active" | "inactive";

export interface Role {
  id: string;
  role_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  active: UserStatus;
  last_login_date?: string;
  password: string;
  manager_id?: string;
  location_id?: string;
  created_at?: string;
  updated_at?: string;
  manager?: User;
  location?: {
    id: string;
    name: string;
  };
}
