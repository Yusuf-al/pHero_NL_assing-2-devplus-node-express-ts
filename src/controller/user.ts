import { Request, Response } from "express";

const createUser = (req: Request, res: Response) => {
  res.send("Router is working from controller");
};

export const userController = {
  createUser,
};
