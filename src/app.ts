import express, { Application, NextFunction, Request, Response } from "express";

import issueRoute from "./issues/issues.route";
import userRouter from "./users/user.route";
import logger from "./middleware/logger";
import globalErrorHandler from "./middleware/globalErrorHandler";
import cors from "cors";
import sendResponse from "./utilities/sendResponse";

const app: Application = express();

app.use(express.json());
app.use(logger);
app.use(cors());

app.use("/api/auth", userRouter);
app.use("/api/issues", issueRoute);

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "server is running",
  });
});

app.use(globalErrorHandler);

export default app;
