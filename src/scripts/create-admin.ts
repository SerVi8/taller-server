import bcrypt from "bcryptjs";

import { sequelize } from "../config/database.js";
import { User } from "../database/models/user.model.js";

const createAdmin = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await User.sync();

    const email = "admin@lubrillantas.com";
    const user = "Admin";
    const password = "Admin1234";

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      console.log("⚠️ El usuario administrador ya existe.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      id: 0,
      name: user,
      email,
      passwordHash,
      role: "admin",
      active: true,
    });

    console.log("✅ Administrador creado");
    console.log(`📧 Email: ${email}`);
    console.log(`📧 User: ${user}`);
    console.log(`🔑 Password: ${password}`);
  } catch (error) {
    console.error("❌ Error creando administrador:");
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

createAdmin();