import express from "express";
import { contributorController } from "../controller/contributor.ts";

const contributorRoute = express.Router();

contributorRoute.get("/", contributorController.contributor);

export default contributorRoute;
