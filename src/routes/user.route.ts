import express from "express";
import { userController } from "../controller/user.controller.ts";

const userRouter = express.Router();

userRouter.post("/signup", userController.createUser);
userRouter.post("/login", userController.loginUser);

export default userRouter;
