import { IUser } from "../types/user.interface.ts";
import bcrypt from "bcrypt";
import { pool } from "./../db/db.ts";
import { Ilogin } from "../types/login.interface.ts";
import jwt from "jsonwebtoken";
import loginUser from "../utilities/getLoginUser.ts";
import { config } from "../utilities/config.ts";

const createUserintoDB = async (payload: IUser) => {
  const { name, password, role, email } = payload;

  if (!name || !password || !role || !email) {
    throw new Error("All fields are required");
  }

  const allowedRoles = ["contributor", "maintainer"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Role should be between contributor or maintainer");
  }

  const hashPass = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPass, role],
  );
  delete result.rows[0].password;
  return result;
};

const userLogin = async (payload: Ilogin) => {
  const { email, password } = payload;
  const userData = await loginUser(email);
  const isMatch = await bcrypt.compare(password, userData.password);

  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }

  const jwtPayload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret, {
    expiresIn: "1d",
  });

  return { jwtPayload, accessToken };
};
export const userService = {
  createUserintoDB,
  userLogin,
};
