import express, { Request, Response } from "express";
import contributorRoute from "./routes/contributor.route.ts";
import maintainerRoute from "./routes/maintainer.route.ts";
import issueRoute from "./routes/issues.route.ts";
import userRouter from "./routes/user.route.ts";
import logger from "./middleware/logger.ts";

const app = express();

app.use(express.json());
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Node + Express + TypeScript server is running!",
  });
});

app.use("/api/auth/", userRouter);
app.use("/api/issues", issueRoute);
app.use("/api/v1/contributor", contributorRoute);
app.use("/api/v1/maintainer", maintainerRoute);

export default app;
