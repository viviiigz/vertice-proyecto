import routerUser from "./user.routes.js";
import { Router } from "express";

const routes = Router();

routes.use("/user", routerUser);

export default routes;

