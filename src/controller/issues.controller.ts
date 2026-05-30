import { Request, Response } from "express";
import { issuesService } from "../service/issues.service.ts";
import { IIssues } from "../types/issues.interface.ts";

const createIssue = async (req: Request<{}, {}, IIssues>, res: Response) => {
  try {
    const { title, description, type, status } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: "All fields are requried",
      });
    }

    const allowedTypes = ["bug", "feature_request"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
      });
    }

    const allowedStatus = ["open", "in_progress", "resolved"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const issue = {
      title,
      description,
      type,
      status: status || "open",
      reporter_id: req.user?.id,
    };

    const result = await issuesService.createIssueIntoDB(issue);

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
    console.log(req.user);
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
