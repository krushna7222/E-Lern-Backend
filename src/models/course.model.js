import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default-image.jpg",
      validate: {
        notEmpty: {
          msg: "Thumbnail is required.",
        },
      },
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startFrom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    courseContent: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    videos: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("videos");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("videos", JSON.stringify(value));
      },
    },
    courseType: {
      type: DataTypes.ENUM("recorded", "live"),
      allowNull: false,
      defaultValue: "live",
    },
    pdf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trainer: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    trainerInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "courses",
    timestamps: true,
  }
);

export default Course;
