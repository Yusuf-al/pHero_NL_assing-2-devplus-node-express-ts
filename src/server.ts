import app from "./app";
import { initDB } from "./db/db";
import { config } from "./config/config";

const PORT = config.port || 2525;

const main = () => {
  initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

main();
