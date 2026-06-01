import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  videoUrl: { type: String, default: "" },
  videoPublicId: { type: String, default: "" },
  duration: { type: Number, default: 0 }, // seconds
  order: { type: Number, default: 0 },
  isPreview: { type: Boolean, default: false },
  resources: [{ name: String, url: String }],
  // Comments on lectures
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Web Development", "Mobile Development", "Data Science",
        "Machine Learning", "Design", "Business", "Marketing",
        "Photography", "Music", "Cybersecurity", "Cloud Computing", "Other",
      ],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    thumbnail: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    sections: [sectionSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ratings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      review: { type: String, maxlength: 1000 },
      createdAt: { type: Date, default: Date.now },
    }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    language: { type: String, default: "English" },
    requirements: [String],
    learningOutcomes: [String],
    totalDuration: { type: Number, default: 0 }, // seconds
    totalLectures: { type: Number, default: 0 },
    // Certificate template
    hasCertificate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for search performance
courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.index({ isPublished: 1, category: 1, level: 1 });
courseSchema.index({ instructor: 1, isPublished: 1 });

// Calculate average rating
courseSchema.methods.calculateRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
};

// Recalculate lecture/duration totals
courseSchema.methods.recalculateTotals = function () {
  this.totalLectures = this.sections.reduce((acc, s) => acc + s.lectures.length, 0);
  this.totalDuration = this.sections.reduce(
    (acc, s) => acc + s.lectures.reduce((a, l) => a + (l.duration || 0), 0),
    0
  );
};

const Course = mongoose.model("Course", courseSchema);
export default Course;
