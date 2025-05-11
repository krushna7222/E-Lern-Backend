import User from "./user.model.js";
import Course from "./course.model.js";
import PurchasedCourse from "./purchasedCourse.model.js";

// Many-to-many if needed
User.belongsToMany(Course, {
  through: PurchasedCourse,
  foreignKey: "userId",
  otherKey: "courseId",
  constraints: true,
});

Course.belongsToMany(User, {
  through: PurchasedCourse,
  foreignKey: "courseId",
  otherKey: "userId",
  constraints: true,
});

// Explicit belongsTo with alias (IMPORTANT for `include`)
PurchasedCourse.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // optional, if you ever include user
});

PurchasedCourse.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course", // ✅ REQUIRED for your current include
});

// Optional reverse access
User.hasMany(PurchasedCourse, { foreignKey: "userId" });
Course.hasMany(PurchasedCourse, { foreignKey: "courseId" });
