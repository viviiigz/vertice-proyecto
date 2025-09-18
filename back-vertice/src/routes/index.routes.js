// src/routes/index.routes.js
import { Router } from "express";
import routerUser from "./user.routes.js";
import routerProduct from "./product.routes.js"; // el router de productos

const routes = Router();

// rutas de usuarios
routes.use("/user", routerUser);

// rutas de productos
routes.use("/productos", routerProduct); // ahora /api/productos...

export default routes;
