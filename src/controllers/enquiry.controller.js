import Enquiry from "../models/enquiry.model.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Op } from "sequelize";

const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, education, course } = req.body;

  if (!name || !email || !phone || !course || !course) {
    throw new ApiError(
      400,
      "Please fill all required fields and select at least one course."
    );
  }

  const newEnquiry = await Enquiry.create({
    name,
    email,
    phone,
    education,
    course,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newEnquiry, "Enquiry submitted successfully"));
});

const getAllEnquryUser = asyncHandler(async (req, res) => {
  const enquiryUser = await Enquiry.findAll({
    order: [["createdAt", "DESC"]],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, enquiryUser, "Enquiry User fetched successfully")
    );
});

const getUserEnquiryUserReport = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    throw new ApiError(400, "From and To dates are required");
  }

  const enquiryUser = await Enquiry.findAll({
    where: {
      createdAt: {
        [Op.between]: [new Date(from), new Date(to)],
      },
    },
    order: [["createdAt", "DESC"]],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, enquiryUser, "Report generated successfully"));
});

export { submitContactForm, getAllEnquryUser, getUserEnquiryUserReport };
