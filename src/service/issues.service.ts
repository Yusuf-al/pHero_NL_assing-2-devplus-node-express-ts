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

const getAllIssues = async (payload: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  const { sort, type, status } = payload;

  let query = `
    SELECT 
      issues.id, issues.title, issues.description, issues.type, issues.status,
      issues.reporter_id, issues.created_at, issues.updated_at,
      users.name, users.role
    FROM issues 
    JOIN users ON issues.reporter_id = users.id
  `;

  const conditions: string[] = [];
  const params: string[] = [];

  if (type) {
    params.push(type);
    conditions.push(`issues.type = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`issues.status = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  if (sort === "newest") {
    query += ` ORDER BY issues.created_at DESC`;
  } else if (sort === "oldest") {
    query += ` ORDER BY issues.created_at ASC`;
  }

  const { rows } = await pool.query(query, params);

  if (!rows.length) return [];

  const formattedResult = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    reporter: {
      id: row.reporter_id,
      name: row.name,
      role: row.role,
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return formattedResult;
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
