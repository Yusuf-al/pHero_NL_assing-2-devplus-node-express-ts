import express from "express";
import { userController } from "../controller/user.ts";

const router = express.Router();

router.post("/signup", userController.createUser);

export default router;
