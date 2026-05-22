import express from "express";
import { userController } from "../controller/user.ts";

const router = express.Router();

router.get("/", userController.createUser);

export default router;
