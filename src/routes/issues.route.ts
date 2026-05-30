import express from "express";
import { issueController } from "../controller/issues.controller.ts";
import auth from "../middleware/auth.ts";

const issueRoute = express.Router();

issueRoute.post("/", auth(), issueController.createIssue);
issueRoute.get(
  "/",
  auth("contributor", "maintainer"),
  issueController.getAllIssues,
);
issueRoute.get("/:id", auth(), issueController.getSingleIssue);
issueRoute.put(
  "/:id",
  auth("contributor", "maintainer"),
  issueController.updateIssue,
);
issueRoute.delete("/:id", auth(), issueController.deleteSingleIssue);

export default issueRoute;
