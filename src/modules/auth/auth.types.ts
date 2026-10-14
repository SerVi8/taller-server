import type { UserRole } from "../../database/models/user.model.js";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}