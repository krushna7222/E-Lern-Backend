import { Router } from "express";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCourse,
  updateCourse,
  addVideoToCourse,
  deleteCourse,
  purchaseCourse,
  verifyPayment,
} from "../controllers/course.controller.js";

const router = Router();

router.route("/create-course").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  adminAuth,
  addCourse
);

router.route("/update-course/:courseId").put(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  adminAuth,
  updateCourse
);

router.post("/:id/add-video", addVideoToCourse);

router.route("/delete-course/:courseId").delete(adminAuth, deleteCourse);

router.post("/buy-course", verifyJWT, purchaseCourse);
router.post("/verify-payment", verifyJWT, verifyPayment);

export default router;
