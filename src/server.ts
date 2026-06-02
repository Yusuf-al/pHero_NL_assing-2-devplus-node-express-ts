import app from "./app.ts";
import { initDB } from "./db/db.ts";
import { config } from "./config/config.ts";

const PORT = config.port || 2525;

const main = () => {
  initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

main();
