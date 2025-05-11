import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  console.log(token);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).cookie("adminToken", token, options).json(
    new ApiResponse(
      200,
      {
        email,
        token,
      },
      "Admin logged in successfully"
    )
  );
});

const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

export { adminLogin, adminLogout };
