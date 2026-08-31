import jwt from "jsonwebtoken";

// ─── Verifies the portal (Member/Visitor) access token, sets req.portalUser.
// Mirrors adminAuthMiddleware.js exactly but reads a separate secret so
// admin and portal tokens can never be swapped for one another. ───
const portalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_PORTAL_ACCESS_SECRET);

    req.portalUser = decoded; // { id, email, role }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default portalAuthMiddleware;
