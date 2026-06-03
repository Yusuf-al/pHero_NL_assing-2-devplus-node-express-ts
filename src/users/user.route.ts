import express from "express";
import { userController } from "./user.controller";

const userRouter = express.Router();

userRouter.post("/signup", userController.createUser);
userRouter.post("/login", userController.loginUser);

export default userRouter;
