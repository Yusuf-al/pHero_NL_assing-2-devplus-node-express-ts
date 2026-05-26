import { Request, Response } from "express";

const contributor = (req: Request, res: Response) => {
  res.send("Router is working from contributor");
};

export const contributorController = {
  contributor,
};
