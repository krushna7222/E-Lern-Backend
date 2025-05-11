import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Enquiry = sequelize.define(
  "Enquiry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    education: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "enquiry",
    timestamps: true,
  }
);

export default Enquiry;
