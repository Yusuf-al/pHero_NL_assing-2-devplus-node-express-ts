import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 2525,
  database: process.env.DB_STRING,
  secret: process.env.JWT_SECRET as string,
};
