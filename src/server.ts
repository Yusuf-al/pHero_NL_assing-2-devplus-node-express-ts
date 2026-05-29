import app from "./app.ts";
import { initDB } from "./utilities/config.ts";

const PORT = process.env.PORT || 2525;

const main = () => {
  initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

main();
