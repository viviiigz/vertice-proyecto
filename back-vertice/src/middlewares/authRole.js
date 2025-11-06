// middleware que verifica el rol
export const authRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    // req.user ya viene de authMiddleware
    if (!req.user) return res.status(401).json({ error: "No autenticado" });

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }

    next(); // usuario autorizado
  };
};
