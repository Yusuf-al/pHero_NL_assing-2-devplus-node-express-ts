import express from "express";
import { maintainerController } from "../controller/maintainer.ts";

const maintainerRoute = express.Router();

maintainerRoute.get("/", maintainerController.maintainer);

export default maintainerRoute;
