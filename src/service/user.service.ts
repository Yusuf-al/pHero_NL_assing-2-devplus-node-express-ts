import { IUser } from "../types/user.interface.ts";
import bcrypt from "bcrypt";
import { pool } from "../utilities/config.ts";
import { Ilogin } from "../types/login.interface.ts";

const createUserintoDB = async (payload: IUser) => {
  const { name, password, role, email } = payload;

  const hashPass = await bcrypt.hash(password, 10);
  console.log(hashPass);
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
  const result = await pool.query(
    `
      SELECT * FROM users WHERE email =$1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user: IUser = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }
  return result;
};
export const userService = {
  createUserintoDB,
  userLogin,
};
