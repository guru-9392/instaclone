import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // Try cookies first
    let token = req.cookies?.token;

    // Fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY || "secret");
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.id = decoded.userId;
    next();
  } catch (error) {
    console.log("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default isAuthenticated;
