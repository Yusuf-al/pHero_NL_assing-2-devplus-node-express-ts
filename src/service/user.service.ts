import { IUser } from "../types/user.interface.ts";
import bcrypt from "bcrypt";
import { pool } from "../utilities/config.ts";
import { Ilogin } from "../types/login.interface.ts";
import jwt from "jsonwebtoken";
import loginUser from "../utilities/getLoginUser.ts";

const createUserintoDB = async (payload: IUser) => {
  const { name, password, role, email } = payload;

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
  const accessToken = jwt.sign(jwtPayload, "sdfie32r5smf-3msdf", {
    expiresIn: "1d",
  });

  return { accessToken };
};
export const userService = {
  createUserintoDB,
  userLogin,
};
