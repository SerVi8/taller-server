import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { User } from "../../database/models/user.model.js";
import type { AuthUser, AuthTokenPayload } from "./auth.types.js";
import { authErrors } from "./auth.errors.js";

export const login = async (
  name: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> => {
  const user = await User.findOne({
    where: {
      name: name.trim(),
    },
  });

  if (!user || !user.active) {
    throw authErrors.invalidCredentials();
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    throw authErrors.invalidCredentials();
  }

  const payload: AuthTokenPayload = {
    sub: String(user.id),
    role: user.role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    user: toAuthUser(user),
  };
};

export const getUserById = async (userId: number): Promise<AuthUser | null> => {
  const user = await User.findByPk(userId);

  if (!user || !user.active) {
    return null;
  }

  return toAuthUser(user);
};

const toAuthUser = (user: User): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});
