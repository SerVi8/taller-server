import { app } from "./app.js";
import { sequelize } from "./config/database.js";
import { env } from "./config/env";
import { initDatabase } from "./database/init.js";
import { User } from "./database/models/index";

const startServer = async (): Promise<void> => {
  try {
    await initDatabase();
    
    app.listen(env.PORT, () => {
      console.log(
        `🚀 API running at http://localhost:${env.PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

void startServer();