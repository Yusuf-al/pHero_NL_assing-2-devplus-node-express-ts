import { pool } from "../db/db";

const loginUser = async (email: string) => {
  const userData = await pool.query(
    `
      SELECT * FROM users WHERE email =$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  return userData.rows[0];
};
export default loginUser;
