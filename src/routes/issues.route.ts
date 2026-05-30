import express from "express";
import { issueController } from "../controller/issues.controller.ts";
import auth from "../middleware/auth.ts";

const issueRoute = express.Router();

issueRoute.post("/", auth(), issueController.createIssue);
issueRoute.get("/", auth(), issueController.getAllIssues);
issueRoute.get("/:id", auth(), issueController.getSingleIssue);
issueRoute.put("/:id", auth(), issueController.updateIssue);
issueRoute.delete(
  "/:id",
  auth("maintainer"),
  issueController.deleteSingleIssue,
);

export default issueRoute;
