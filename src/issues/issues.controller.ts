import { Request, Response } from "express";
import { issuesService } from "./issues.service";
import { IIssues } from "./issues.interface";
import sendResponse from "../utilities/sendResponse";

const createIssue = async (req: Request<{}, {}, IIssues>, res: Response) => {
  try {
    const { title, description, type, status } = req.body;

    if (!title || !description || !type) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "All fields are requried",
      });
    }

    const allowedTypes = ["bug", "feature_request"];

    if (!allowedTypes.includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type",
      });
    }

    const allowedStatus = ["open", "in_progress", "resolved"];

    if (status && !allowedStatus.includes(status)) {
      return sendResponse(res, {
        statusCode: 400,
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
    sendResponse(res, {
      statusCode: 200,
      message: "Issue created successfully",
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: `Failed to create issue`,
      error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const allIssues = await issuesService.getAllIssues(req.query);
    sendResponse(res, {
      statusCode: 200,
      message: "All Issues are retrieved successfully",
      success: true,
      data: allIssues,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: `Failed to get all the issues`,
      error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getSingleIssue(req.params);

    sendResponse(res, {
      statusCode: 200,
      message: "Issue retrived successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: `Failed to get issue with id ${req.params.id} `,
      error,
    });
  }
};

const deleteSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.deleteSingleIssue(req.params);

    sendResponse(res, {
      statusCode: 200,
      message: "Issue deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: 500,
      message: `Failed to get issue with id ${req.params.id} `,
      success: false,
      error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const body = req.body;

    const result = await issuesService.updateIssue({ id, user, body });
    sendResponse(res, {
      statusCode: 200,
      message: "Issue Updated successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: `Failed to update issue with id ${req.params.id} `,
      error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  deleteSingleIssue,
  updateIssue,
};
