// src/routes/index.routes.js
import { Router } from "express";
import routerUser from "./user.routes.js";
import routerProduct from "./product.routes.js"; // el router de productos
import routerAdmin from "./admin.routes.js"; // rutas de admin (panel)

const routes = Router();

// rutas de usuarios
routes.use("/user", routerUser);

// rutas de productos
routes.use("/productos", routerProduct); // ahora /api/productos...

// rutas de administración (panel)
routes.use("/admin", routerAdmin); // ahora /api/admin/solicitudes

export default routes;
