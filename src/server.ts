import { app } from "./app.js";
import { sequelize } from "./config/database.js";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    
    app.listen(env.PORT, () => {
      console.log(
        `🚀 API running at http://localhost:${env.PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    console.error(error);
    process.exit(1);
  }
};

startServer();