import { Request, Response } from "express";
import { pool } from "../utilities/config.ts";
import bcrypt from "bcrypt";
import { IUser } from "../types/user.interface.ts";

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, password, role, email } = req.body;

    const hashPass = await bcrypt.hash(password, 10);
    console.log(hashPass);

    const result = await pool.query<IUser>(
      `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1,$2,$3,$4) RETURNING name, email, role
    `,
      [name, email, hashPass, role],
    );

    res.status(201).json({
      message: "User Created",
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: `Failed to create user `,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM users WHERE email =$1
    `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const user: IUser = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.status(201).json({
      message: "Login Successful",
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: `Login failed `,
    });
  }
};

export const userController = {
  createUser,
  loginUser,
};
