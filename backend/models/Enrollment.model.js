import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  progress: [{
    lecture: { type: mongoose.Schema.Types.ObjectId },
    section: { type: mongoose.Schema.Types.ObjectId },
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
  completionPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  paymentStatus: { type: String, enum: ["free", "paid", "pending"], default: "free" },
  amountPaid: { type: Number, default: 0 },
  certificateUrl: { type: String },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
