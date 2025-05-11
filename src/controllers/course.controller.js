import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import razorpay from "../utils/razorpay.js";
import PurchasedCourse from "../models/purchasedCourse.model.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// 1. Add Course
// const addCourse = asyncHandler(async (req, res) => {
//   // try {
//   //   console.log("Received data:", req.body); // Log incoming data

//   //   const course = await Course.create(req.body);
//   //   res.status(201).json(course);
//   // } catch (error) {
//   //   console.error("Error in creating course:", error); // Show exact error
//   //   res.status(500).json({ error: error.message });
//   // }

//   const {
//     courseName,
//     price,
//     description,
//     courseContent,
//     trainer,
//     trainerInfo,
//     courseType,
//   } = req.body;

//   if (
//     [courseName, price, description, courseContent, trainer, courseType].some(
//       (field) => !field?.toString().trim()
//     )
//   ) {
//     throw new ApiError(400, "All fields are required including course type");
//   }

//   if (!["recorded", "live"].includes(courseType)) {
//     throw new ApiError(400, "Course type must be either 'recorded' or 'live'");
//   }

//   const imageLocalPath = req.files?.image?.[0]?.path;
//   if (!imageLocalPath) {
//     throw new ApiError(400, "Course image is required");
//   }

//   const uploadedImage = await uploadOnCloudinary(imageLocalPath);
//   if (!uploadedImage?.url) {
//     throw new ApiError(400, "Image upload failed");
//   }

//   const course = await Course.create({
//     image: uploadedImage.url,
//     courseName,
//     price,
//     description,
//     courseContent: JSON.parse(courseContent),
//     trainer,
//     trainerInfo,
//     courseType,
//   });

//   return res
//     .status(201)
//     .json(new ApiResponse(201, course, "Course created successfully"));
// });
const addCourse = asyncHandler(async (req, res) => {
  const {
    courseName,
    price,
    description,
    courseContent,
    startFrom,
    trainer,
    courseType,
    trainerInfo,
  } = req.body;

  if (
    [
      courseName,
      price,
      description,
      startFrom,
      courseContent,
      trainer,
      courseType,
    ].some((field) => !field?.toString().trim())
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!["recorded", "live"].includes(courseType)) {
    throw new ApiError(400, "Course type must be either 'recorded' or 'live'");
  }

  // ✅ Image upload
  const imageLocalPath = req.files?.image?.[0]?.path;
  if (!imageLocalPath) {
    throw new ApiError(400, "Course image is required");
  }

  const uploadedImage = await uploadOnCloudinary(imageLocalPath);
  if (!uploadedImage?.url) {
    throw new ApiError(400, "Image upload failed");
  }

  // ✅ PDF upload (optional but recommended)
  const pdfLocalPath = req.files?.pdf?.[0]?.path;
  if (!pdfLocalPath) {
    throw new ApiError(400, "Course PDF is required");
  }

  const uploadedPdf = await uploadOnCloudinary(pdfLocalPath, "raw");

  // const uploadedPdf = await cloudinary.uploader.upload(pdfLocalPath, {
  //   folder: "E-learning_website",
  //   resource_type: "raw",
  // });
  // fs.unlinkSync(pdfLocalPath);

  if (!uploadedPdf?.url) {
    throw new ApiError(400, "PDF upload failed");
  }
  console.log("Uploaded file URL:", uploadedPdf.secure_url);

  // ✅ Save to DB
  const course = await Course.create({
    image: uploadedImage.url,
    courseName,
    price,
    description,
    startFrom,
    courseContent: JSON.parse(courseContent),
    trainer,
    courseType,
    trainerInfo,
    pdf: uploadedPdf.url,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, course, "Course created successfully"));
});

// const addCourse = asyncHandler(async (req, res) => {
//   const { courseName, price, description, courseContent } = req.body;

//   const user = req.user;
//   if (!user) throw new ApiError(401, "Unauthorized");

//   if (!["admin", "teacher"].includes(user.role)) {
//     throw new ApiError(403, "Only admins or teachers can create courses");
//   }

//   const author = `${user.name}`;

//   if (
//     [courseName, price, description, courseContent].some(
//       (field) => !field?.trim()
//     )
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const imageLocalPath = req.files?.image?.[0]?.path;
//   if (!imageLocalPath) {
//     throw new ApiError(400, "Course image is required");
//   }

//   const uploadedImage = await uploadOnCloudinary(imageLocalPath);
//   if (!uploadedImage?.url) {
//     throw new ApiError(400, "Image upload failed");
//   }

//   const course = await Course.create({
//     image: uploadedImage.url,
//     courseName,
//     price,
//     description,
//     courseContent: JSON.parse(courseContent),
//     author,
//   });

//   return res
//     .status(201)
//     .json(new ApiResponse(201, course, "Course created successfully"));
// });

// 2. Update Course
// const updateCourse = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { courseName, price, description, courseContent } = req.body;

//   const course = await Course.findByPk(id);
//   if (!course) throw new ApiError(404, "Course not found");

//   // Optional image update
//   if (req.files?.image?.[0]?.path) {
//     const newImage = await uploadOnCloudinary(req.files.image[0].path);
//     if (newImage?.url) course.image = newImage.url;
//   }

//   course.courseName = courseName || course.courseName;
//   course.price = price || course.price;
//   course.description = description || course.description;
//   course.courseContent = courseContent
//     ? JSON.parse(courseContent)
//     : course.courseContent;

//   await course.save();

//   res
//     .status(200)
//     .json(new ApiResponse(200, course, "Course updated successfully"));
// });

// const updateCourse = asyncHandler(async (req, res) => {
//   const { courseId } = req.params;
//   const { courseName, price, description, courseContent } = req.body;

//   const course = await Course.findByPk(courseId);
//   if (!course) throw new ApiError(404, "Course not found");

//   let updatedData = {
//     courseName,
//     price,
//     description,
//     courseContent: courseContent ? JSON.parse(courseContent) : undefined,
//   };

//   Object.keys(updatedData).forEach(
//     (key) => updatedData[key] === undefined && delete updatedData[key]
//   );

//   if (req.files?.image?.[0]?.path) {
//     const newImage = await uploadOnCloudinary(req.files.image[0].path);
//     if (newImage?.url) {
//       updatedData.image = newImage.url;
//     }
//   }

//   await Course.update(updatedData, { where: { id: courseId } });

//   const updatedCourse = await Course.findByPk(courseId);

//   res
//     .status(200)
//     .json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
// });

const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const {
    courseName,
    price,
    description,
    startFrom,
    courseContent,
    videos,
    courseType,
  } = req.body;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (courseType && !["recorded", "live"].includes(courseType)) {
    throw new ApiError(400, "Course type must be either 'recorded' or 'live'");
  }

  let updatedData = {
    courseName,
    price,
    description,
    startFrom,
    courseType,
    courseContent: courseContent ? JSON.parse(courseContent) : undefined,
    videos: videos ? JSON.parse(videos) : undefined,
  };

  Object.keys(updatedData).forEach(
    (key) => updatedData[key] === undefined && delete updatedData[key]
  );

  if (req.files?.image?.[0]?.path) {
    const newImage = await uploadOnCloudinary(req.files.image[0].path);
    if (newImage?.url) {
      updatedData.image = newImage.url;
    }
  }

  await Course.update(updatedData, { where: { id: courseId } });

  const updatedCourse = await Course.findByPk(courseId);

  res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

// 3. Delete Course
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  await course.destroy();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Course deleted successfully"));
});

//4. Add Video To Course

// const addVideoToCourse = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { videoUrl } = req.body;

//   if (!videoUrl?.trim()) {
//     throw new ApiError(400, "Video URL is required");
//   }

//   const course = await Course.findByPk(id);
//   if (!course) {
//     throw new ApiError(404, "Course not found");
//   }

//   const currentVideos = course.videos || [];

//   currentVideos.push(videoUrl.trim());

//   course.videos = currentVideos;

//   await course.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, course, "Video added to course successfully"));
// });

const addVideoToCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { videoUrl, topic } = req.body;

  if (!videoUrl?.trim() || !topic?.trim()) {
    throw new ApiError(400, "Both video URL and topic are required");
  }

  const course = await Course.findByPk(id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const currentVideos = course.videos || [];

  currentVideos.push({
    topic: topic.trim(),
    url: videoUrl.trim(),
  });

  course.videos = currentVideos;

  await course.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, course.videos, "Video added to course successfully")
    );
});

// 5. Get All Courses
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    order: [["createdAt", "DESC"]],
  });

  res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses fetched successfully"));
});

// 6. purchaseCourse

const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  const course = await Course.findByPk(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // 1. Check if already purchased and verified
  const verifiedPurchase = await PurchasedCourse.findOne({
    where: { userId, courseId, isPaymentVerified: true },
  });

  if (verifiedPurchase) {
    return res
      .status(200)
      .json(
        new ApiError(
          200,
          null,
          "You have already purchased this course. Enrollment is already complete."
        )
      );
  }

  const existingUnverified = await PurchasedCourse.findOne({
    where: { userId, courseId, isPaymentVerified: false },
  });

  if (existingUnverified) {
    await existingUnverified.destroy();
  }

  const options = {
    amount: course.price * 100,
    currency: "INR",
    receipt: `receipt_order_${courseId}_${userId}_${Date.now()}`,
    notes: { courseId, userId },
  };

  const order = await razorpay.orders.create(options);

  await PurchasedCourse.create({
    userId,
    courseId,
    isPaymentVerified: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        courseName: course.courseName,
        courseId: course.id,
        key: process.env.RAZORPAY_KEY_ID,
      },
      "Razorpay order created successfully"
    )
  );
});

// //!For Testing--
// const purchaseCourse = asyncHandler(async (req, res) => {
//   const { courseId } = req.body;
//   const userId = req.user.id;
//   console.log(userId);

//   if (!courseId) {
//     throw new ApiError(400, "Course ID is required");
//   }

//   const course = await Course.findByPk(courseId);
//   if (!course) {
//     throw new ApiError(404, "Course not found");
//   }
//   const existingPurchase = await PurchasedCourse.findOne({
//     where: {
//       userId,
//       courseId,
//       isPaymentVerified: true,
//     },
//   });

//   if (existingPurchase) {
//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           null,
//           "You have already purchased this course. Enrollment is already complete."
//         )
//       );
//   }

//   // Mocked Razorpay response (for Postman testing)
//   const mockOrder = {
//     id: "order_mock123",
//     amount: course.price * 100,
//     currency: "INR",
//     receipt: `receipt_order_${courseId}_${userId}`,
//     status: "created",
//     notes: {
//       courseId: courseId,
//       userId: userId,
//     },
//   };

//   try {
//     await PurchasedCourse.create({
//       userId,
//       courseId,
//       isPaymentVerified: false,
//     });
//   } catch (error) {
//     console.error("❌ Error creating PurchasedCourse:", error);
//     throw new ApiError(500, "Failed to create purchase record");
//   }

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         success: true,
//         orderId: mockOrder.id,
//         amount: mockOrder.amount,
//         currency: mockOrder.currency,
//         courseName: course.courseName,
//         courseId: course.id,
//         key: "test_key_mocked",
//       },
//       "Mock Razorpay order created for testing"
//     )
//   );
// });

//?

// 7. verify payment

// const verifyPayment = asyncHandler(async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;
//   const userId = req.user.id;

//   const generatedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   if (generatedSignature !== razorpay_signature) {
//     throw new ApiError(400, "Payment verification failed");
//   }

//   // Update verification status
//   await PurchasedCourse.update(
//     { isPaymentVerified: true },
//     {
//       where: {
//         userId,
//       },
//     }
//   );
//   await User.update({ isPayment: true }, { where: { id: req.user.id } });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "Payment verified and course added"));
// });

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const userId = req.user.id;

  // //!  test mode enabled via environment variable
  // if (process.env.TEST_MODE === "true") {
  //   console.log("🔁 Running in TEST_MODE: Skipping Razorpay verification");

  //   try {
  //     await PurchasedCourse.update(
  //       { isPaymentVerified: true },
  //       { where: { userId } }
  //     );

  //     await User.update({ isPayment: true }, { where: { id: userId } });

  //     return res
  //       .status(200)
  //       .json(
  //         new ApiResponse(200, null, "✅ Mock payment verified successfully")
  //       );
  //   } catch (error) {
  //     console.error("❌ Error updating records:", error);
  //     throw new ApiError(500, "Failed to verify mock payment");
  //   }
  // }

  // //?

  // const generatedSignature = crypto
  //   .createHmac("sha256", process.env.RAZORPAY_SECRET)
  //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  //   .digest("hex");

  // if (generatedSignature !== razorpay_signature) {
  //   throw new ApiError(400, "❌ Payment verification failed");
  // }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "❌ Payment verification failed");
  }

  await PurchasedCourse.update(
    { isPaymentVerified: true },
    { where: { userId } }
  );
  await User.update({ isPayment: true }, { where: { id: userId } });
  console.log("payment verify done");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "✅ Payment verified and course added"));
});

// 8. get my-purchases-course for user

const getMyCourses = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const purchasedCourses = await PurchasedCourse.findAll({
    where: {
      userId,
      isPaymentVerified: true,
    },
    include: [
      {
        model: Course,
        as: "course",
        attributes: [
          "id",
          "courseName",
          "description",
          "price",
          "startFrom",
          "image",
          "courseContent",
          "videos",
          "pdf",
          "trainer",
          "trainerInfo",
        ],
      },
    ],
  });

  if (!purchasedCourses || purchasedCourses.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          [],
          "You have not purchased any courses. Please purchase a course."
        )
      );
  }

  const courses = purchasedCourses
    .map((pc) => pc.course)
    .filter((c) => c !== null);

  return res
    .status(200)
    .json(
      new ApiResponse(200, courses, "Fetched purchased courses successfully")
    );
});

// const getAllPurchasedUsers = asyncHandler(async (req, res) => {
//   const purchases = await PurchasedCourse.findAll({
//     include: [
//       {
//         model: User,
//         attributes: ["id", "name", "email"],
//       },
//       {
//         model: Course,
//         attributes: ["id", "courseName", "price"],
//       },
//     ],
//   });

//   const responseData = purchases.map((purchase) => ({
//     userId: purchase.userId,
//     userName: purchase.User?.name,
//     userEmail: purchase.User?.email,
//     courseId: purchase.courseId,
//     courseName: purchase.Course?.courseName,
//     coursePrice: purchase.Course?.price,
//     isPaymentVerified: purchase.isPaymentVerified,
//     purchasedAt: purchase.createdAt,
//   }));

//   return res
//     .status(200)
//     .json(new ApiResponse(200, responseData, "Fetched all purchased users"));
// });

const getAllPurchasedUsers = asyncHandler(async (req, res) => {
  const purchases = await PurchasedCourse.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
      {
        model: Course,
        as: "course",
        attributes: ["id", "courseName", "price"],
      },
    ],
  });

  const responseData = purchases.map((purchase) => ({
    userId: purchase.userId,
    userName: purchase.user?.name,
    userEmail: purchase.user?.email,
    courseId: purchase.courseId,
    courseName: purchase.course?.courseName,
    coursePrice: purchase.course?.price,
    isPaymentVerified: purchase.isPaymentVerified,
    purchasedAt: purchase.createdAt,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseData,
        "✅ Purchased users fetched successfully"
      )
    );
});

export {
  addCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
  getAllCourses,
  purchaseCourse,
  verifyPayment,
  getMyCourses,
  getAllPurchasedUsers,
};
