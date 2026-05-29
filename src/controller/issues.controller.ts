import { Request, Response } from "express";
import { issuesService } from "../service/issues.service.ts";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.createIssueIntoDB(req.body);

    res.status(201).json({
      message: "Issue created successfully",
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create issue",
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const allIssues = await issuesService.getAllIssues(req.query);

    res.status(200).json({
      message: "All Issues are retrieved successfully",
      success: true,
      data: allIssues.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get all the issues",
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getSingleIssue(req.params);

    res.status(200).json({
      message: `Issues with id ${req.params.id} retrieved successfully`,
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: `Failed to get issue with id ${req.params.id} `,
    });
  }
};

const deleteSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.deleteSingleIssue(req.params);

    res.status(204).json({
      success: true,
      message: "Issue deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: `Failed to get issue with id ${req.params.id} `,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  deleteSingleIssue,
};
