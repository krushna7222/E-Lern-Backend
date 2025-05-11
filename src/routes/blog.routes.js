import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import {
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";

const router = Router();

router.route("/create-blog").post(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  adminAuth,
  createBlog
);

router.route("/update-blog/:blogId").put(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  adminAuth,
  updateBlog
);
router.route("/delete-blog/:blogId").delete(adminAuth, deleteBlog);

export default router;
