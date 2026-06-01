import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import Enrollment from "../models/Enrollment.model.js";
import { uploadToCloudinary, uploadVideo, deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const {
      category, level, search, minPrice, maxPrice,
      page = 1, limit = 12, sort = "-createdAt",
    } = req.query;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select("-sections.lectures.videoUrl -sections.lectures.videoPublicId")
        .lean(),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        hasNext: skip + courses.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public (with optional auth)
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatar bio createdCourses")
      .populate("ratings.user", "name avatar");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let courseData = course.toObject();

    // FIX: Check if user is enrolled OR is the instructor/admin before showing video URLs
    let canWatchVideos = false;

    if (req.user) {
      const isInstructor = course.instructor._id.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";

      if (isInstructor || isAdmin) {
        canWatchVideos = true;
      } else {
        // Check enrollment
        const enrollment = await Enrollment.findOne({
          student: req.user.id,
          course: req.params.id,
        });
        canWatchVideos = !!enrollment;
      }
    }

    // Strip video URLs if user cannot watch (not enrolled / not instructor / not admin)
    if (!canWatchVideos) {
      courseData.sections = courseData.sections.map((s) => ({
        ...s,
        lectures: s.lectures.map((l) => ({
          ...l,
          // FIX: only expose videoUrl for preview lectures to non-enrolled users
          videoUrl: l.isPreview ? l.videoUrl : undefined,
          videoPublicId: undefined,
        })),
      }));
    } else {
      // Still strip videoPublicId from client for security, but keep videoUrl
      courseData.sections = courseData.sections.map((s) => ({
        ...s,
        lectures: s.lectures.map((l) => ({
          ...l,
          videoPublicId: undefined,
        })),
      }));
    }

    res.status(200).json({ success: true, course: courseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
  try {
    const {
      title, description, category, level, price, isFree,
      tags, requirements, learningOutcomes, language,
    } = req.body;

    let thumbnail = { url: "", publicId: "" };
    if (req.files?.thumbnail) {
      const result = await uploadToCloudinary(req.files.thumbnail, "learnkro/thumbnails");
      thumbnail = { url: result.url, publicId: result.publicId };
    }

    // FIX: safely parse JSON fields that may come as strings from FormData
    const parsedTags = tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [];
    const parsedRequirements = requirements ? (typeof requirements === "string" ? JSON.parse(requirements) : requirements) : [];
    const parsedOutcomes = learningOutcomes ? (typeof learningOutcomes === "string" ? JSON.parse(learningOutcomes) : learningOutcomes) : [];

    const course = await Course.create({
      title, description, category, level,
      price: (isFree === "true" || isFree === true) ? 0 : Number(price) || 0,
      isFree: isFree === "true" || isFree === true,
      tags: parsedTags,
      requirements: parsedRequirements,
      learningOutcomes: parsedOutcomes,
      language: language || "English",
      thumbnail,
      instructor: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, { $push: { createdCourses: course._id } });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowed = ["title","description","category","level","price","isFree","tags","requirements","learningOutcomes","language"];
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    if (req.files?.thumbnail) {
      if (course.thumbnail.publicId) {
        await deleteFromCloudinary(course.thumbnail.publicId);
      }
      const result = await uploadToCloudinary(req.files.thumbnail, "learnkro/thumbnails");
      updateData.thumbnail = { url: result.url, publicId: result.publicId };
    }

    course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (course.thumbnail?.publicId) {
      await deleteFromCloudinary(course.thumbnail.publicId);
    }
    for (const section of course.sections) {
      for (const lecture of section.lectures) {
        if (lecture.videoPublicId) {
          await deleteFromCloudinary(lecture.videoPublicId, "video");
        }
      }
    }

    await course.deleteOne();
    await User.findByIdAndUpdate(req.user.id, { $pull: { createdCourses: course._id } });

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add section
// @route   POST /api/courses/:id/sections
// @access  Private (Instructor)
export const addSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (!req.body.title?.trim()) {
      return res.status(400).json({ success: false, message: "Section title is required" });
    }

    course.sections.push({ title: req.body.title.trim(), order: course.sections.length });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add lecture to section
// @route   POST /api/courses/:id/sections/:sectionId/lectures
// @access  Private (Instructor)


// @desc    Add lecture to section
// @route   POST /api/courses/:id/sections/:sectionId/lectures
// @access  Private (Instructor)

export const addLecture = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const section = course.sections.id(req.params.sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    let videoUrl = "";
    let videoPublicId = "";
    let duration = 0;

    // video upload
    if (req.files && req.files.video) {
      const videoFile = req.files.video;

      const allowedMimes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
        "video/mkv",
        "video/quicktime",
      ];

      if (!allowedMimes.includes(videoFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid video format",
        });
      }

      const result = await uploadVideo(
        videoFile,
        "learnkro/lectures"
      );

      console.log("Cloudinary Upload:", result);

      // FIX
      videoUrl =
        result.secure_url ||
        result.url ||
        "";

      videoPublicId =
        result.public_id ||
        result.publicId ||
        "";

      duration =
        Math.round(result.duration || 0);
    }

    const lecture = {
      title: req.body.title?.trim(),

      description:
        req.body.description?.trim() || "",

      videoUrl,
      videoPublicId,
      duration,

      isPreview:
        req.body.isPreview === "true" ||
        req.body.isPreview === true,

      order: section.lectures.length,
    };

    section.lectures.push(lecture);

    course.recalculateTotals();

    await course.save();

    res.status(201).json({
      success: true,
      message: "Lecture added successfully",
      course,
    });

  } catch (error) {
    console.log("LECTURE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






// @desc    Delete lecture
// @route   DELETE /api/courses/:id/sections/:sectionId/lectures/:lectureId
// @access  Private (Instructor)
export const deleteLecture = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    const lecture = section.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });

    if (lecture.videoPublicId) {
      await deleteFromCloudinary(lecture.videoPublicId, "video");
    }

    lecture.deleteOne();
    course.recalculateTotals();
    await course.save();

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to lecture
// @route   POST /api/courses/:id/sections/:sectionId/lectures/:lectureId/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "Comment text required" });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const section = course.sections.id(req.params.sectionId);
    const lecture = section?.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });

    lecture.comments.push({ user: req.user.id, text: text.trim() });
    await course.save();

    const updated = await Course.findById(req.params.id)
      .populate("sections.lectures.comments.user", "name avatar");
    const updatedLecture = updated.sections.id(req.params.sectionId)?.lectures.id(req.params.lectureId);

    res.status(201).json({ success: true, comments: updatedLecture?.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate/review course
// @route   POST /api/courses/:id/rate
// @access  Private (Student)
export const rateCourse = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const alreadyRated = course.ratings.find((r) => r.user.toString() === req.user.id);
    if (alreadyRated) {
      alreadyRated.rating = rating;
      alreadyRated.review = review;
    } else {
      course.ratings.push({ user: req.user.id, rating, review });
    }

    course.calculateRating();
    await course.save();

    await Notification.create({
      user: course.instructor,
      type: "course_update",
      title: "New Course Review",
      message: `${req.user.name} rated your course "${course.title}" ${rating}/5`,
      link: `/instructor/courses/${course._id}/manage`,
    });

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
