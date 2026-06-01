import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    // FIX: only allow student/instructor roles; block admin self-registration
    const allowedRoles = ["student", "instructor"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password, role: role || "student" });

    // Welcome notification
    await Notification.create({
      user: user._id,
      type: "system",
      title: "Welcome to LearnKro! 🎉",
      message: "Your account is ready. Start exploring courses and earning XP!",
      link: "/courses",
    });

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, token, user: userObj });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // FIX: explicitly select password (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await user.updateActivity();

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses", "title thumbnail");
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
