import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { User } from "../models/user.model.js";

export const seedAdmin = async (): Promise<void> => {
  // if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

  
  
  const adminExists = await User.findOne({ where: { name: "Admin" } });
  if (adminExists) return;

  await User.create({
    name: "Admin",
    email: "admin@lubrillantas.com",
    passwordHash: await bcrypt.hash("Admin1234", 12),
    role: "admin",
  });

  console.log(`✅ Admin inicial creado: Admin`);
};