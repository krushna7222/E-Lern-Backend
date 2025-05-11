import crypto from "crypto";
import User from "../models/user.model.js";
import razorpay from "../utils/razorpay.js";
import { asyncHandler } from "../utils/asyncHandeler.js";

// Create Razorpay Order

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || !receipt) {
      return res
        .status(400)
        .json({ message: "Amount and receipt are required." });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    //     //! Another Way
    //     // const options = {
    //     //   amount: course.price * 100,
    //     //   currency: "INR",
    //     //   receipt: `receipt_order_${course.id}_${Date.now()}`,
    //     // };

    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Problem in create order:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create Razorpay order",
      error: error.message,
    });
  }
});

//!testing for create-order

// const createOrder = asyncHandler(async (req, res) => {
//   try {
//     const { amount, currency = "INR", receipt } = req.body;

//     if (!amount || !receipt) {
//       return res
//         .status(400)
//         .json({ message: "Amount and receipt are required." });
//     }

//     // Mock order object like Razorpay would return
//     const mockOrder = {
//       id: "order_mock123",
//       amount: amount * 100,
//       currency,
//       receipt,
//       status: "created",
//     };

//     return res.status(201).json({
//       success: true,
//       message: "Mock order created successfully",
//       order: mockOrder,
//     });
//   } catch (error) {
//     console.error("Mock create order error:", error);
//     return res.status(500).json({ message: "Mock order creation failed" });
//   }
// });

//Verify Razorpay Payment

const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    //!For Testing
    // if (
    //   razorpay_order_id &&
    //   razorpay_payment_id &&
    //   razorpay_signature === "mock-valid-signature"
    // ) {
    //   // temporarily bypass
    //   await User.update({ isPayment: true }, { where: { id: req.user.id } });
    //   return res.status(200).json({ message: "Mock verified!" });
    // }

    if (generatedSignature === razorpay_signature) {
      await User.update({ isPayment: true }, { where: { id: req.user.id } });
      return res
        .status(200)
        .json({ message: "Payment verified and access granted!" });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid signature. Payment verification failed." });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { updatePaymentStatus, createOrder };
