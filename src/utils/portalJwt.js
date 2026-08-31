import jwt from "jsonwebtoken";

// ─── Portal (Member/Visitor) access & refresh tokens — kept separate from
// the Admin token pair (utils/jwt.js) so the two auth systems never mix ───

export const generatePortalAccessToken = (actor, extra = {}) => {
  return jwt.sign(
    {
      id: actor.id,
      email: actor.email,
      role: actor.role, // "MEMBER" | "VISITOR"
      ...extra,
    },
    process.env.JWT_PORTAL_ACCESS_SECRET,
    {
      expiresIn: process.env.PORTAL_ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

export const generatePortalRefreshToken = (actor, extra = {}) => {
  return jwt.sign(
    {
      id: actor.id,
      role: actor.role,
      ...extra,
    },
    process.env.JWT_PORTAL_REFRESH_SECRET,
    {
      expiresIn: process.env.PORTAL_REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};
