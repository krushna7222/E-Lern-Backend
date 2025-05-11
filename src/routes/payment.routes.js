import express from "express";
import {
  updatePaymentStatus,
  createOrder,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-order", verifyJWT, createOrder);
router.post("/verify", verifyJWT, updatePaymentStatus);

export default router;
