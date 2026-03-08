import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  return res.json(req.user);
};

export const updateProfile = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name) user.name = name;
  if (email) user.email = email;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await user.save();

  return res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt
  });
};
