import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import User from "./user.model.js";
import Course from "./course.model.js";

const PurchasedCourse = sequelize.define(
  "PurchasedCourse",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // model: User,
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // model: Course,
        model: "courses",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    isPaymentVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "purchasedcourses",
    timestamps: true,
  }
);

export default PurchasedCourse;
