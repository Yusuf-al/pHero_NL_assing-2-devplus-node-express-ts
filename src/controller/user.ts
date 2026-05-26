import { Request, Response } from "express";
import { pool } from "../utilities/config.ts";

const createUser = async (req: Request, res: Response) => {
  const { name, password, role, email } = req.body;

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1,$2,$3,$4) RETURNING name, email, role
    `,
    [name, email, password, role],
  );

  res.status(200).json({
    message: "User Created",
    success: true,
    data: result.rows[0],
  });

  console.log(result);
};

export const userController = {
  createUser,
};
