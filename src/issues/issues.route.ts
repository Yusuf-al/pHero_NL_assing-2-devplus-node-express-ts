import express from "express";
import { issueController } from "./issues.controller";
import auth from "../middleware/auth";

const issueRoute = express.Router();

issueRoute.post("/", auth(), issueController.createIssue);
issueRoute.get("/", issueController.getAllIssues);
issueRoute.get("/:id", auth(), issueController.getSingleIssue);
issueRoute.put("/:id", auth(), issueController.updateIssue);
issueRoute.delete(
  "/:id",
  auth("maintainer"),
  issueController.deleteSingleIssue,
);

export default issueRoute;
