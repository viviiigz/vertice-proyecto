//importar rutas totatles para despues exportaerlas en un solo archivo
import { Router } from "express";
import productRoutes from "./product.routes.js";
import commerceRoutes from "./commerce.routes.js";

const router = Router();

//definir rutas
router.use("/products", productRoutes);
router.use("/commerces", commerceRoutes);

export default router;
