import { Router } from "express";
import { adminLogin, adminLogout } from "../controllers/admin.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import {
  getAllUsers,
  getUserRegistrationReport,
} from "../controllers/user.controller.js";
import { getAllBlogs } from "../controllers/blog.controller.js";
import {
  getAllCourses,
  getAllPurchasedUsers,
} from "../controllers/course.controller.js";
import {
  getAllEnquryUser,
  getUserEnquiryUserReport,
} from "../controllers/enquiry.controller.js";

const router = Router();

router.route("/login").post(adminLogin);
router.route("/admin-logout").post(adminAuth, adminLogout);

router.route("/all-users").get(adminAuth, getAllUsers);
router.route("/all-blog").get(adminAuth, getAllBlogs);
router.route("/all-courses").get(adminAuth, getAllCourses);
router.route("/purchased-user").get(adminAuth, getAllPurchasedUsers);
router.route("/user-report").post(adminAuth, getUserRegistrationReport);
router.route("/all-enquiry-user").get(adminAuth, getAllEnquryUser);
router.route("/enquiry-user-report").post(adminAuth, getUserEnquiryUserReport);

export default router;
