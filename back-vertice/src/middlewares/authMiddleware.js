import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Busca el token en el header Authorization o en la cookie
  let token = null;
  const authHeader = req.headers.authorization;
  console.log("Token recibido:", token);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};