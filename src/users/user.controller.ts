import { Request, Response } from "express";
import { userService } from "./user.service.ts";
import sendResponse from "../utilities/sendResponse.ts";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserintoDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "User Created",
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create user",
      error: error,
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
