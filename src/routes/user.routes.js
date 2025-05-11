import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  isPaidUser,
  forgotPassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllBlogs } from "../controllers/blog.controller.js";
import {
  getAllCourses,
  getMyCourses,
} from "../controllers/course.controller.js";

import { submitContactForm } from "../controllers/enquiry.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").put(verifyJWT, updateAccountDetails);

//direct route
router.route("/all-blogs").get(getAllBlogs);
router.route("/all-courses").get(getAllCourses);
router.route("/submit-contact-form").post(submitContactForm);
router.route("/forgot-password").post(forgotPassword);

//For Paid User
router.get("/my-courses", verifyJWT, getMyCourses);
router.get("/premium-content", verifyJWT, isPaidUser, (req, res) => {
  res.send("Welcome to premium content!");
});

export default router;
