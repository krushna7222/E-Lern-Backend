import Blog from "../models/blog.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandeler.js";

//?Done

const createBlog = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if ([title, content].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const blog = await Blog.create({
    thumbnail: thumbnail.url,
    title,
    content,
  });

  const createdBlog = await Blog.findByPk(blog.id);

  if (!createdBlog) {
    throw new ApiError(500, "Something went wrong while creating blog");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdBlog, "Blog Successfully Created.."));
});

//?Done

const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { title, content } = req.body;

  const blog = await Blog.findByPk(blogId);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Optional: Validate inputs
  if ([title, content].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  let thumbnailUrl = blog.thumbnail;

  if (req.files?.thumbnail?.[0]?.path) {
    const thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);
    if (!thumbnail?.url) {
      throw new ApiError(400, "Failed to upload new thumbnail");
    }
    thumbnailUrl = thumbnail.url;
  }

  await blog.update({ title, content, thumbnail: thumbnailUrl });

  return res
    .status(200)
    .json(new ApiResponse(200, blog, "Blog updated successfully"));
});

//?Done

const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const blog = await Blog.findByPk(blogId);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  await blog.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Blog deleted successfully"));
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.findAll({
    order: [["createdAt", "DESC"]],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
});

export { createBlog, updateBlog, deleteBlog, getAllBlogs };
