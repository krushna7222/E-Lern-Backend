import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Manually generating JWTs if not using model instance methods
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    // Save refresh token to user record
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token."
    );
  }
};

// ?DONE

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password, phone, education, referralCode } =
    req.body;

  if (
    [name, email, username, password, phone, education, referralCode].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }],
    },
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ where: { referralCode } });
    if (referrer) {
      referredBy = referrer.referralCode;
    }
  }

  const user = await User.create({
    name,
    email,
    username,
    password,
    phone,
    education,
    referredBy,
  });

  user.referralCode = `REF-${user.username}`;
  await user.save();

  const { password: _, refreshToken, ...userData } = user.toJSON();

  return res
    .status(201)
    .json(new ApiResponse(200, userData, "User registered Successfully"));
});

// ?DONE

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; // Take only one field: "identifier" (email or username)

  if (!identifier || !password) {
    throw new ApiError(
      400,
      "Identifier (username or email) and password are required"
    );
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user.id
  );

  const { password: _, refreshToken: __, ...userData } = user.toJSON();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: userData,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

// const loginUser = asyncHandler(async (req, res) => {
//   const { email, username, password } = req.body;

//   if (!(username || email)) {
//     throw new ApiError(400, "username or email is required");
//   }

//   const user = await User.findOne({
//     where: {
//       [Op.or]: [{ username }, { email }],
//     },
//   });

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   // const isPasswordValid = await user.isPasswordCorrect(password);
//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials");
//   }

//   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
//     user.id
//   );

//   const { password: _, refreshToken: __, ...userData } = user.toJSON();

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: userData,
//           accessToken,
//           refreshToken,
//         },
//         "User logged In Successfully"
//       )
//     );
// });

// ?DONE

const logoutUser = asyncHandler(async (req, res) => {
  await User.update({ refreshToken: null }, { where: { id: req.user.id } });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//?Done

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findByPk(decodedToken?.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// ?DONE

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;

//   const user = await User.findByPk(req.user?.id);
//   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

//   if (!isPasswordCorrect) {
//     throw new ApiError(400, "Invalid old password");
//   }

//   user.password = newPassword;
//   await user.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Password changed successfully"));
// });

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { emailOrUsername, newPassword } = req.body;

  if (!emailOrUsername || !newPassword) {
    throw new ApiError(400, "Email/Username and new password are required");
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password has been updated successfully"));
});

// ?DONE

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user?.id, {
    attributes: { exclude: ["password", "refreshToken"] },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

// ?DONE

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, name, email, education, phone } = req.body;

  if (!username || !name || !email || !education || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  await User.update(
    { username, name, email, education, phone },
    { where: { id: req.user.id } }
  );

  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password", "refreshToken"] },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// const getUserRegistrationReport = asyncHandler(async (req, res) => {
//   const { fromDate, tillDate } = req.body;

//   if (!fromDate || !tillDate) {
//     throw new ApiError(400, "Both fromDate and tillDate are required");
//   }

//   const from = new Date(fromDate);
//   const till = new Date(tillDate);

//   if (isNaN(from) || isNaN(till)) {
//     throw new ApiError(400, "Invalid date format");
//   }

//   const users = await User.findAll({
//     where: {
//       createdAt: {
//         [Op.between]: [from, till],
//       },
//     },
//     attributes: {
//       exclude: ["password", "refreshToken"],
//     },
//     order: [["createdAt", "DESC"]],
//   });

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         users,
//         `Found ${users.length} user(s) registered between ${fromDate} and ${tillDate}`
//       )
//     );
// });

const getUserRegistrationReport = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    throw new ApiError(400, "From and To dates are required");
  }

  const users = await User.findAll({
    where: {
      createdAt: {
        [Op.between]: [new Date(from), new Date(to)],
      },
    },
    attributes: {
      exclude: ["password", "refreshToken"],
    },
    order: [["createdAt", "DESC"]],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Report generated successfully"));
});

const isPaidUser = async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  if (!user?.isPayment) {
    return res
      .status(403)
      .json({ message: "Please complete the payment first." });
  }
  next();
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  forgotPassword,
  getCurrentUser,
  updateAccountDetails,
  getAllUsers,
  getUserRegistrationReport,
  isPaidUser,
};
