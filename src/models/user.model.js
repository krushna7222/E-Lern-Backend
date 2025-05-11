import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../db/connection.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    education: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referralCode: {
      type: DataTypes.STRING,
      unique: true,
    },

    referredBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    timestamps: true,
    tableName: "users",
  }
);

//  Hash the password before creating user
User.beforeCreate(async (user, options) => {
  user.password = await bcrypt.hash(user.password, 10);
});

//  Add instance method to compare passwords
User.prototype.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// access token method
User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//  Refresh Token Method
User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export default User;
