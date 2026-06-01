import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    bio: { type: String, maxlength: 500 },
    isApproved: {
      type: Boolean,
      default: function () {
        // Students and admins are auto-approved; instructors need admin approval
        return this.role !== "instructor";
      },
    },
    isBanned: { type: Boolean, default: false },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    // Watch history for "Continue Watching" feature
    watchHistory: [{
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      lecture: { type: mongoose.Schema.Types.ObjectId },
      watchedAt: { type: Date, default: Date.now },
    }],
    // Gamification
    xp: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: { type: Date, default: Date.now } }],
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    // Notifications preferences
    notificationPrefs: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update lastActive & streak
userSchema.methods.updateActivity = async function () {
  const now = new Date();
  const lastActive = this.lastActive;
  const diffHours = lastActive ? (now - lastActive) / (1000 * 60 * 60) : 999;

  if (diffHours >= 20 && diffHours < 48) {
    this.streak += 1;
  } else if (diffHours >= 48) {
    this.streak = 1;
  }
  this.lastActive = now;
  await this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
