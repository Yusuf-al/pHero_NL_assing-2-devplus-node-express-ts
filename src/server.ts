import express, { Request, Response } from "express";
import router from "./routes/route.ts";
import contributorRoute from "./routes/contributor.route.ts";
import maintainerRoute from "./routes/maintainer.route.ts";
import { initDB } from "./utilities/config.ts";

const app = express();
const PORT = process.env.PORT || 2525;
initDB();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Node + Express + TypeScript server is running!",
  });
});

app.use("/api/auth/", router);
app.use("/api/v1/contributor", contributorRoute);
app.use("/api/v1/maintainer", maintainerRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
