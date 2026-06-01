import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Enrollment from "../models/Enrollment.model.js";

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, pendingInstructors] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      User.countDocuments({ role: "instructor", isApproved: false }),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const coursesByCategory = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find()
      .sort("-createdAt")
      .limit(5)
      .select("name email role createdAt avatar");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        pendingInstructors,
        usersByRole,
        coursesByCategory,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .select("-password");

    const total = await User.countDocuments(query);

    res.status(200).json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject instructor
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin)
export const approveInstructor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "instructor") {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    user.isApproved = req.body.approved;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Instructor ${req.body.approved ? "approved" : "rejected"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin)
export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot ban admin" });
    }

    user.isBanned = req.body.banned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${req.body.banned ? "banned" : "unbanned"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete admin" });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses (admin view)
// @route   GET /api/admin/courses
// @access  Private (Admin)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .select("title category isPublished enrolledStudents averageRating createdAt price");

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle course publish status
// @route   PUT /api/admin/courses/:id/publish
// @access  Private (Admin)
export const toggleCoursePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? "published" : "unpublished"}`,
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
