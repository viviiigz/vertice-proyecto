import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  console.log('🔐 authMiddleware - Headers:', req.headers.authorization);
  
  // Busca el token en el header Authorization o en la cookie
  let token = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log('✓ Token encontrado en header');
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('✓ Token encontrado en cookie');
  }
  
  if (!token) {
    console.log('❌ No se encontró token');
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✓ Token verificado:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", error.message);
    res.status(401).json({ error: "Token inválido" });
  }
};