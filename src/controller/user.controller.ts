import { Request, Response } from "express";
import { pool } from "../utilities/config.ts";
import bcrypt from "bcrypt";
import { IUser } from "../types/user.interface.ts";
import { userService } from "../service/user.service.ts";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserintoDB(req.body);
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
    const { accessToken, jwtPayload } = await userService.userLogin(req.body);
    res.status(200).json({
      success: true,
      message: "Login Successful",
      data: {
        token: accessToken,
        user: {
          ...jwtPayload,
        },
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
