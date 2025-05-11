import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Blog = sequelize.define(
  "Blog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default-thumbnail.jpg",
      validate: {
        notEmpty: {
          msg: "Thumbnail is required.",
        },
      },
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title is required.",
        },
      },
    },

    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      validate: {
        len: {
          args: [1, 10000],
          msg: "Content must be between 1 and 10000 characters.",
        },
      },
    },
  },
  {
    tableName: "blogs",
    timestamps: true,
  }
);

export default Blog;
