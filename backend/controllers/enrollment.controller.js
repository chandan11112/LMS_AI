import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.isPublished) return res.status(400).json({ success: false, message: "Course is not available" });

    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user.id, course: req.params.courseId,
    });
    if (alreadyEnrolled) return res.status(400).json({ success: false, message: "Already enrolled" });

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId,
      paymentStatus: course.isFree ? "free" : "paid",
      amountPaid: course.price,
    });

    // FIX: use $addToSet to avoid duplicate entries in arrays
    await Promise.all([
      Course.findByIdAndUpdate(req.params.courseId, { $addToSet: { enrolledStudents: req.user.id } }),
      User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: req.params.courseId } }),
    ]);

    // Notify instructor
    await Notification.create({
      user: course.instructor,
      type: "enrollment",
      title: "New Enrollment",
      message: `${req.user.name} enrolled in your course "${course.title}"`,
      link: `/instructor/students`,
    });

    // Award XP for enrollment
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 50 } });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: "course",
        populate: { path: "instructor", select: "name avatar" },
        select: "title thumbnail category level totalLectures averageRating instructor isPublished",
      })
      .sort("-createdAt")
      .lean();

    // FIX: filter out null courses (deleted courses)
    const valid = enrollments.filter((e) => e.course !== null);

    res.status(200).json({ success: true, enrollments: valid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { lectureId, sectionId, completed } = req.body;
    if (!lectureId || !sectionId) {
      return res.status(400).json({ success: false, message: "lectureId and sectionId required" });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id, course: req.params.courseId,
    });
    if (!enrollment) return res.status(404).json({ success: false, message: "Not enrolled" });

    const progressItem = enrollment.progress.find((p) => p.lecture.toString() === lectureId);
    if (progressItem) {
      progressItem.completed = completed;
      if (completed) progressItem.completedAt = new Date();
    } else {
      enrollment.progress.push({
        lecture: lectureId, section: sectionId, completed,
        completedAt: completed ? new Date() : undefined,
      });
    }

    const course = await Course.findById(req.params.courseId).select("sections");
    const totalLectures = course.sections.reduce((acc, s) => acc + s.lectures.length, 0);
    const completedCount = enrollment.progress.filter((p) => p.completed).length;

    enrollment.completionPercentage = totalLectures > 0
      ? Math.round((completedCount / totalLectures) * 100)
      : 0;

    if (enrollment.completionPercentage === 100 && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();

      // Award XP + badge for completion
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { xp: 500 },
        $push: {
          badges: { name: "Course Completer", icon: "🎓", earnedAt: new Date() },
        },
      });

      await Notification.create({
        user: req.user.id,
        type: "achievement",
        title: "Course Completed! 🎓",
        message: `Congratulations! You've completed the course. Your certificate is ready.`,
        link: `/dashboard/my-courses`,
      });
    } else if (completed) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 10 } });
    }

    // Update watch history
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { watchHistory: { course: req.params.courseId } },
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        watchHistory: {
          $each: [{ course: req.params.courseId, lecture: lectureId }],
          $position: 0,
          $slice: 20,
        },
      },
    });

    await enrollment.save();
    res.status(200).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id, course: req.params.courseId,
    });
    res.status(200).json({ success: true, isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
