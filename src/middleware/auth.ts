import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "../utilities/config.ts";
import loginUser from "../utilities/getLoginUser.ts";

const auth = (...roles: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const { name, email, role } = jwt.verify(
        token as string,
        "sdfie32r5smf-3msdf",
      ) as JwtPayload;

      const userData = await loginUser(email);

      req.user = userData;

      delete userData.password;

      if (roles.length && !roles.includes(userData.role)) {
        return res.status(403).json({
          success: false,
          message: "Request forbidden ",
        });
      }

      next();
    } catch (error) {
      next(error);

      res.status(403).json({
        success: false,
        message: "Request forbidden ",
      });
    }
  };
};

export default auth;
