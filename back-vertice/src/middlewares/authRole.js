// middleware que verifica el rol
export const authRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    console.log('🔐 authRole - Usuario:', req.user);
    console.log('🔐 authRole - Roles permitidos:', rolesPermitidos);
    
    // req.user ya viene de authMiddleware
    if (!req.user) {
      console.log('❌ No hay usuario en req.user');
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      console.log('❌ Rol no permitido. Usuario tiene:', req.user.role);
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }

    console.log('✓ Usuario autorizado');
    next(); // usuario autorizado
  };
};
