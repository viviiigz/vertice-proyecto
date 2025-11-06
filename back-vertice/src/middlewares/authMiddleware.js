import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Busca el token en el header Authorization o en la cookie
  let token = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log("Token extraído del header Authorization");
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("Token extraído de cookie");
  } else {
    console.log("No se encontró token en headers ni cookies");
  }
  
  if (!token) {
    console.log("No autorizado - token vacío");
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Token verificado - Usuario:", decoded.email, "- Rol:", decoded.role);
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    res.status(401).json({ error: "Token inválido" });
  }
};