import { IIssues } from "../types/issues.interface.ts";
import { pool } from "../utilities/config.ts";

const createIssueIntoDB = async (payload: IIssues) => {
  const { title, description, type, reporter_id, status } = payload;
  const result = await pool.query<IIssues>(
    `
      INSERT INTO issues (title, description, type,status, reporter_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
    [title, description, type, status, reporter_id],
  );

  return result;
};

const getAllIssues = async (payload: any) => {
  const { sort, type, status } = payload;
  console.log(payload);

  let query = `SELECT * FROM issues JOIN users on issues.reporter_id = users.id`;

  //   if (sort === "newest") {
  //     query += ` ORDER BY created_at DESC`;
  //   } else if (sort === "oldest") {
  //     query += ` ORDER BY created_at ASC`;
  //   } else if (type === "bug") {
  //     query += `SELECT * FROM issues WHERE type = bug`;
  //   } else if (type === "feature_request") {
  //     query += `SELECT * FROM issues WHERE type = feature_request`;
  //   } else if (status === "open") {
  //     query += `SELECT * FROM issues WHERE status = open`;
  //   } else if (status === "in_progress") {
  //     query += `SELECT * FROM issues WHERE status = in_progress`;
  //   } else if (status === "resolved") {
  //     query += `SELECT * FROM issues WHERE status = resolved`;
  //   }

  const allIssues = await pool.query(query);
  console.log(allIssues.rows[0]);
  return allIssues;
};

const getSingleIssue = async (payload: any) => {
  const { id } = payload;

  let query = `SELECT * FROM issues WHERE id = $1`;

  const result = await pool.query<IIssues>(query, [id]);

  if (result.rows.length <= 0) {
    throw new Error(`Issue with id ${id} not found`);
  }

  return result;
};

const deleteSingleIssue = async (payload: any) => {
  const { id } = payload;

  let query = `DELETE FROM issues WHERE id = $1`;

  const result = await pool.query(query, [id]);

  if (result.rows.length <= 0) {
    throw new Error(`Issue with id ${id} not found`);
  }

  return result;
};

export const issuesService = {
  createIssueIntoDB,
  getAllIssues,
  getSingleIssue,
  deleteSingleIssue,
};
