import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findByPk(decodedToken.id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    throw new ApiError(401, "Invalid or expired token");
  }
});
