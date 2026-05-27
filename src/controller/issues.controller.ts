import { Request, Response } from "express";
import { pool } from "../utilities/config.ts";
import { IIssues } from "../types/issues.interface.ts";

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;

    const result = await pool.query<IIssues>(
      `
      INSERT INTO issues (title, description, type)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, description, type],
    );

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
    const { sort } = req.query;

    let query = `SELECT * FROM issues`;

    if (sort === "newest") {
      query += ` ORDER BY created_at DESC`;
    } else if (sort === "oldest") {
      query += ` ORDER BY created_at ASC`;
    }

    const allIssues = await pool.query<IIssues>(query);

    res.status(200).json({
      message: "All Issues retrieved successfully",
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
    const { id } = req.params;

    let query = `SELECT * FROM issues WHERE id = $1`;

    const result = await pool.query<IIssues>(query, [id]);

    if (result.rows.length <= 0) {
      return res.status(404).json({
        success: false,
        message: `Issue with id ${id} not found`,
      });
    }

    res.status(200).json({
      message: `Issues with id ${id} retrieved successfully`,
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
    const { id } = req.params;

    let query = `DELETE FROM issues WHERE id = $1`;

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Issue with id ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
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
