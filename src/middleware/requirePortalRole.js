// ─── Mirrors roleMiddleware.js but checks req.portalUser instead of req.admin ───
const requirePortalRole = (...roles) => {
  return (req, res, next) => {
    if (!req.portalUser || !roles.includes(req.portalUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export default requirePortalRole;
