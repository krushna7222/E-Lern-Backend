import User from "../models/user.model.js";

const isPaidUser = async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  if (!user?.isPayment) {
    return res
      .status(403)
      .json({ message: "Please complete the payment first." });
  }
  next();
};

export default isPaidUser;
