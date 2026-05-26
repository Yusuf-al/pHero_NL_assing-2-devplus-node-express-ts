import { Request, Response } from "express";

const maintainer = (req: Request, res: Response) => {
  res.send("Router is working from maintainer");
};

export const maintainerController = {
  maintainer,
};
