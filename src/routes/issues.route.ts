import express from "express";
import { issueController } from "../controller/issues.controller.ts";

const issueRoute = express.Router();

issueRoute.post("/", issueController.createIssue);
issueRoute.get("/", issueController.getAllIssues);
issueRoute.get("/:id", issueController.getSingleIssue);
issueRoute.delete("/:id", issueController.deleteSingleIssue);

export default issueRoute;
