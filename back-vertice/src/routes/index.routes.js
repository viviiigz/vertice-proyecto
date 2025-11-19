// src/routes/index.routes.js
import { Router } from "express";
import routerUser from "./user.routes.js";
import routerProduct from "./product.routes.js"; // el router de productos
import routerAdmin from "./admin.routes.js"; // rutas de admin (panel)
import routerPerfil from "./perfil.routes.js"; // rutas de perfil
//gestion de estadisticas y puntos pickUp
import pickUpPointRoutes from './pickUpPointRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';
import estadisticasRoutes from './estadisticasRoutes.js';
import publicRoutes from './publicRoutes.js';
import reporteRoutes from './reporte.routes.js';



const routes = Router();

// rutas de usuarios
routes.use("/user", routerUser);

// rutas de productos
routes.use("/productos", routerProduct); // ahora /api/productos...

// rutas de administración (panel)
routes.use("/admin", routerAdmin); // ahora /api/admin/solicitudes

// rutas de perfil (requiere autenticación)
routes.use("/perfil", routerPerfil); // ahora /api/perfil

//rutas para pedidos y puntos pickUp
routes.use('/pickup-points', pickUpPointRoutes);
routes.use('/pedidos', pedidoRoutes);
routes.use('/comercio', estadisticasRoutes);
//rutas publicas
routes.use('/api', publicRoutes);
// rutas de reportes/soporte
routes.use('/reportes', reporteRoutes); // ahora /api/reportes

export default routes;
