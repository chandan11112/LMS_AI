import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ─── Inline schema definitions (avoids import path issues) ───────────────────

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    avatar: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    bio: { type: String },
    isApproved: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    watchHistory: [{ course: mongoose.Schema.Types.ObjectId, lecture: mongoose.Schema.Types.ObjectId, watchedAt: { type: Date, default: Date.now } }],
    xp: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: { type: Date, default: Date.now } }],
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    notificationPrefs: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true } },
  },
  { timestamps: true }
);

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: { type: String, default: "" },
  videoPublicId: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isPreview: { type: Boolean, default: false },
  resources: [{ name: String, url: String }],
  comments: [{ user: mongoose.Schema.Types.ObjectId, text: String, createdAt: { type: Date, default: Date.now } }],
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    thumbnail: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    tags: [String],
    sections: [sectionSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ratings: [{ user: mongoose.Schema.Types.ObjectId, rating: Number, review: String, createdAt: { type: Date, default: Date.now } }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    language: { type: String, default: "English" },
    requirements: [String],
    learningOutcomes: [String],
    totalDuration: { type: Number, default: 0 },
    totalLectures: { type: Number, default: 0 },
    hasCertificate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    progress: [{ lecture: mongoose.Schema.Types.ObjectId, section: mongoose.Schema.Types.ObjectId, completed: Boolean, completedAt: Date }],
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    paymentStatus: { type: String, enum: ["free", "paid", "pending"], default: "free" },
    amountPaid: { type: Number, default: 0 },
    certificateUrl: String,
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: Number,
  explanation: String,
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timeLimit: { type: Number, default: 10 },
    attempts: [{ user: mongoose.Schema.Types.ObjectId, score: Number, answers: mongoose.Schema.Types.Mixed, xpEarned: Number, takenAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["enrollment", "course_update", "quiz_result", "achievement", "system", "comment"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const Notification = mongoose.model("Notification", notificationSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/learnKroAi_fixed";

async function seed() {
  await mongoose.connect(MONGO_URI, { maxPoolSize: 10 });
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Quiz.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ── 1. Users ───────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@learnkro.ai",
    password: hashedPassword,
    role: "admin",
    isApproved: true,
    bio: "Platform administrator",
    xp: 500,
    streak: 10,
    badges: [{ name: "Admin", icon: "🛡️" }],
  });

  const instructors = await User.create([
    {
      name: "Priya Sharma",
      email: "priya@learnkro.ai",
      password: hashedPassword,
      role: "instructor",
      isApproved: true,
      bio: "Full-stack developer with 8 years of experience. Passionate about teaching web technologies.",
      xp: 1200,
      streak: 25,
      badges: [
        { name: "Top Instructor", icon: "🏆" },
        { name: "Early Adopter", icon: "⭐" },
      ],
    },
    {
      name: "Arjun Mehta",
      email: "arjun@learnkro.ai",
      password: hashedPassword,
      role: "instructor",
      isApproved: true,
      bio: "Data scientist and ML engineer. Former researcher at IIT Delhi.",
      xp: 980,
      streak: 15,
      badges: [{ name: "Data Guru", icon: "📊" }],
    },
    {
      name: "Neha Kapoor",
      email: "neha@learnkro.ai",
      password: hashedPassword,
      role: "instructor",
      isApproved: false, // pending approval
      bio: "UI/UX designer and frontend developer. Loves crafting beautiful interfaces.",
      xp: 300,
      streak: 5,
    },
  ]);

  const students = await User.create([
    {
      name: "Ravi Kumar",
      email: "ravi@example.com",
      password: hashedPassword,
      role: "student",
      bio: "Aspiring web developer from Bangalore.",
      xp: 450,
      streak: 7,
      badges: [{ name: "Quick Learner", icon: "⚡" }],
    },
    {
      name: "Anjali Singh",
      email: "anjali@example.com",
      password: hashedPassword,
      role: "student",
      bio: "Computer science student. Interested in machine learning.",
      xp: 820,
      streak: 20,
      badges: [
        { name: "Streak Master", icon: "🔥" },
        { name: "Quiz Champion", icon: "🎯" },
      ],
    },
    {
      name: "Vikram Patel",
      email: "vikram@example.com",
      password: hashedPassword,
      role: "student",
      bio: "Working professional upskilling in data science.",
      xp: 190,
      streak: 3,
    },
    {
      name: "Meera Nair",
      email: "meera@example.com",
      password: hashedPassword,
      role: "student",
      bio: "Fresher looking to break into the tech industry.",
      xp: 60,
      streak: 1,
    },
  ]);

  console.log(`👥 Created ${1 + instructors.length + students.length} users`);

  // ── 2. Courses ─────────────────────────────────────────────────────────────
  const courses = await Course.create([
    {
      title: "The Complete React & Node.js Bootcamp",
      description:
        "Master full-stack web development from scratch. Learn React 18, Node.js, Express, MongoDB, REST APIs, JWT authentication, and deploy real-world projects. This is the most comprehensive full-stack course available.",
      instructor: instructors[0]._id,
      category: "Web Development",
      level: "Beginner",
      thumbnail: { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg", publicId: "course_thumb_1" },
      price: 1299,
      isFree: false,
      tags: ["React", "Node.js", "MongoDB", "Express", "Full Stack", "JavaScript"],
      language: "English",
      requirements: [
        "Basic HTML & CSS knowledge",
        "Familiarity with JavaScript fundamentals",
        "A computer with internet access",
      ],
      learningOutcomes: [
        "Build full-stack web applications with React and Node.js",
        "Design and consume REST APIs",
        "Implement JWT-based authentication",
        "Deploy apps to production using cloud platforms",
        "Work with MongoDB and Mongoose ODM",
      ],
      isPublished: true,
      hasCertificate: true,
      sections: [
        {
          title: "Introduction & Setup",
          order: 1,
          lectures: [
            { title: "Welcome & Course Overview", description: "What you'll learn in this bootcamp.", duration: 420, order: 1, isPreview: true },
            { title: "Installing Node.js & VS Code", description: "Set up your development environment.", duration: 780, order: 2, isPreview: true },
            { title: "JavaScript Refresher", description: "Quick recap of modern JS (ES6+).", duration: 1800, order: 3 },
          ],
        },
        {
          title: "React Fundamentals",
          order: 2,
          lectures: [
            { title: "What is React?", description: "Understanding the React library.", duration: 900, order: 1 },
            { title: "Components & Props", description: "Building reusable UI components.", duration: 1500, order: 2 },
            { title: "State & useState Hook", description: "Managing component state.", duration: 1800, order: 3 },
            { title: "useEffect & Lifecycle", description: "Side effects in functional components.", duration: 2100, order: 4 },
          ],
        },
        {
          title: "Node.js & Express Backend",
          order: 3,
          lectures: [
            { title: "Node.js Basics", description: "Introduction to server-side JavaScript.", duration: 1200, order: 1 },
            { title: "Building a REST API with Express", description: "Create endpoints and handle HTTP methods.", duration: 2400, order: 2 },
            { title: "Connecting MongoDB with Mongoose", description: "Database integration and schemas.", duration: 2700, order: 3 },
            { title: "JWT Authentication", description: "Secure your API with JSON Web Tokens.", duration: 2400, order: 4 },
          ],
        },
      ],
      ratings: [
        { user: students[0]._id, rating: 5, review: "Best course I've taken! The projects are really practical." },
        { user: students[1]._id, rating: 4, review: "Very thorough, great explanations. Could use more advanced topics." },
        { user: students[2]._id, rating: 5, review: "Priya explains everything so clearly. Highly recommended!" },
      ],
      averageRating: 4.7,
      totalRatings: 3,
      enrolledStudents: [students[0]._id, students[1]._id, students[2]._id],
      totalDuration: 18000,
      totalLectures: 11,
    },
    {
      title: "Python for Data Science & Machine Learning",
      description:
        "A comprehensive guide to data science using Python. Covers NumPy, Pandas, Matplotlib, Scikit-Learn, and an introduction to deep learning with TensorFlow. Build real ML models and gain hands-on experience.",
      instructor: instructors[1]._id,
      category: "Data Science",
      level: "Intermediate",
      thumbnail: { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg", publicId: "course_thumb_2" },
      price: 1499,
      isFree: false,
      tags: ["Python", "Data Science", "Machine Learning", "Pandas", "NumPy", "TensorFlow"],
      language: "English",
      requirements: [
        "Basic Python programming",
        "High school level mathematics",
      ],
      learningOutcomes: [
        "Perform exploratory data analysis with Pandas",
        "Visualise data with Matplotlib and Seaborn",
        "Build and evaluate ML models with Scikit-Learn",
        "Understand neural networks and deep learning basics",
        "Work on real-world datasets",
      ],
      isPublished: true,
      hasCertificate: true,
      sections: [
        {
          title: "Python Data Science Essentials",
          order: 1,
          lectures: [
            { title: "NumPy Arrays & Operations", description: "Fast numerical computing with NumPy.", duration: 1800, order: 1, isPreview: true },
            { title: "Pandas DataFrames", description: "Data manipulation and analysis.", duration: 2400, order: 2 },
            { title: "Data Cleaning Techniques", description: "Handling missing values and outliers.", duration: 1800, order: 3 },
          ],
        },
        {
          title: "Machine Learning Fundamentals",
          order: 2,
          lectures: [
            { title: "Introduction to Machine Learning", description: "Supervised vs unsupervised learning.", duration: 1500, order: 1, isPreview: true },
            { title: "Linear Regression", description: "Build your first predictive model.", duration: 2100, order: 2 },
            { title: "Classification with Decision Trees", description: "Tree-based models and evaluation.", duration: 2400, order: 3 },
            { title: "Model Evaluation & Cross-Validation", description: "Avoiding overfitting, tuning models.", duration: 1800, order: 4 },
          ],
        },
      ],
      ratings: [
        { user: students[1]._id, rating: 5, review: "Arjun is an amazing teacher. The ML section was mind-blowing." },
        { user: students[3]._id, rating: 4, review: "Great course. I wish there was more content on deep learning." },
      ],
      averageRating: 4.5,
      totalRatings: 2,
      enrolledStudents: [students[1]._id, students[3]._id],
      totalDuration: 13800,
      totalLectures: 7,
    },
    {
      title: "UI/UX Design Fundamentals with Figma",
      description:
        "Learn the principles of user-centred design, wireframing, prototyping, and building design systems using Figma. Ideal for beginners and developers who want to understand design.",
      instructor: instructors[0]._id,
      category: "Design",
      level: "Beginner",
      thumbnail: { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", publicId: "course_thumb_3" },
      price: 0,
      isFree: true,
      tags: ["UI/UX", "Figma", "Design", "Prototyping", "Wireframing"],
      language: "English",
      requirements: ["No prior design experience needed"],
      learningOutcomes: [
        "Understand UX research and user personas",
        "Create wireframes and high-fidelity mockups in Figma",
        "Build interactive prototypes",
        "Apply design systems and component libraries",
      ],
      isPublished: true,
      hasCertificate: true,
      sections: [
        {
          title: "Design Thinking & UX Basics",
          order: 1,
          lectures: [
            { title: "What is UI/UX Design?", description: "Difference between UI and UX.", duration: 600, order: 1, isPreview: true },
            { title: "User Research Methods", description: "Surveys, interviews, and personas.", duration: 1200, order: 2 },
            { title: "Information Architecture", description: "Organising content for usability.", duration: 900, order: 3 },
          ],
        },
        {
          title: "Figma Masterclass",
          order: 2,
          lectures: [
            { title: "Figma Interface Tour", description: "Getting started with Figma.", duration: 900, order: 1, isPreview: true },
            { title: "Frames, Components & Auto Layout", description: "Core Figma building blocks.", duration: 2100, order: 2 },
            { title: "Prototyping & Interactions", description: "Create clickable prototypes.", duration: 1800, order: 3 },
          ],
        },
      ],
      ratings: [
        { user: students[0]._id, rating: 5, review: "Free and incredibly valuable. Thank you!" },
        { user: students[2]._id, rating: 5, review: "Changed the way I think about building products." },
      ],
      averageRating: 5.0,
      totalRatings: 2,
      enrolledStudents: [students[0]._id, students[2]._id, students[3]._id],
      totalDuration: 7500,
      totalLectures: 6,
    },
    {
      title: "Cybersecurity Essentials: Ethical Hacking & Penetration Testing",
      description:
        "Learn ethical hacking, network security, vulnerability assessment, and penetration testing methodologies. Prepare for CompTIA Security+ and CEH certifications.",
      instructor: instructors[1]._id,
      category: "Cybersecurity",
      level: "Advanced",
      thumbnail: { url: "", publicId: "" },
      price: 1999,
      isFree: false,
      tags: ["Cybersecurity", "Ethical Hacking", "Penetration Testing", "Networking", "Linux"],
      language: "English",
      requirements: [
        "Basic networking knowledge",
        "Familiarity with Linux command line",
        "Understanding of TCP/IP",
      ],
      learningOutcomes: [
        "Understand attack vectors and defence strategies",
        "Perform vulnerability scanning with industry tools",
        "Conduct penetration tests ethically",
        "Analyse and respond to security incidents",
      ],
      isPublished: false, // draft
      hasCertificate: true,
      sections: [
        {
          title: "Introduction to Cybersecurity",
          order: 1,
          lectures: [
            { title: "Security Fundamentals", description: "CIA triad, threats, and risks.", duration: 1200, order: 1, isPreview: true },
            { title: "Networking for Hackers", description: "Protocols, ports, and packet analysis.", duration: 1800, order: 2 },
          ],
        },
      ],
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      enrolledStudents: [],
      totalDuration: 3000,
      totalLectures: 2,
    },
  ]);

  // Update instructors' createdCourses
  await User.findByIdAndUpdate(instructors[0]._id, {
    createdCourses: [courses[0]._id, courses[2]._id],
  });
  await User.findByIdAndUpdate(instructors[1]._id, {
    createdCourses: [courses[1]._id, courses[3]._id],
  });

  // Update students' enrolledCourses
  await User.findByIdAndUpdate(students[0]._id, { enrolledCourses: [courses[0]._id, courses[2]._id] });
  await User.findByIdAndUpdate(students[1]._id, { enrolledCourses: [courses[0]._id, courses[1]._id] });
  await User.findByIdAndUpdate(students[2]._id, { enrolledCourses: [courses[0]._id, courses[2]._id] });
  await User.findByIdAndUpdate(students[3]._id, { enrolledCourses: [courses[1]._id, courses[2]._id] });

  console.log(`📚 Created ${courses.length} courses`);

  // ── 3. Enrollments ─────────────────────────────────────────────────────────
  // Helper: build progress array from course sections
  const buildProgress = (course, completedCount = 0) => {
    const progress = [];
    let count = 0;
    for (const section of course.sections) {
      for (const lecture of section.lectures) {
        const isCompleted = count < completedCount;
        progress.push({
          lecture: lecture._id,
          section: section._id,
          completed: isCompleted,
          completedAt: isCompleted ? new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000) : undefined,
        });
        count++;
      }
    }
    return progress;
  };

  const totalLectures = (course) =>
    course.sections.reduce((acc, s) => acc + s.lectures.length, 0);

  const enrollments = await Enrollment.create([
    // Ravi: course[0] – 60% done
    {
      student: students[0]._id,
      course: courses[0]._id,
      progress: buildProgress(courses[0], Math.floor(totalLectures(courses[0]) * 0.6)),
      completionPercentage: 60,
      paymentStatus: "paid",
      amountPaid: courses[0].price,
      lastAccessedAt: new Date(),
    },
    // Ravi: course[2] (free) – 100% done
    {
      student: students[0]._id,
      course: courses[2]._id,
      progress: buildProgress(courses[2], totalLectures(courses[2])),
      completionPercentage: 100,
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      paymentStatus: "free",
      certificateUrl: "https://learnkro.ai/certificates/ravi-uiux-2024",
    },
    // Anjali: course[0] – 90% done
    {
      student: students[1]._id,
      course: courses[0]._id,
      progress: buildProgress(courses[0], Math.floor(totalLectures(courses[0]) * 0.9)),
      completionPercentage: 90,
      paymentStatus: "paid",
      amountPaid: courses[0].price,
    },
    // Anjali: course[1] – 40% done
    {
      student: students[1]._id,
      course: courses[1]._id,
      progress: buildProgress(courses[1], Math.floor(totalLectures(courses[1]) * 0.4)),
      completionPercentage: 40,
      paymentStatus: "paid",
      amountPaid: courses[1].price,
    },
    // Vikram: course[0] – 20% done
    {
      student: students[2]._id,
      course: courses[0]._id,
      progress: buildProgress(courses[0], 2),
      completionPercentage: 20,
      paymentStatus: "paid",
      amountPaid: courses[0].price,
    },
    // Vikram: course[2] (free) – just started
    {
      student: students[2]._id,
      course: courses[2]._id,
      progress: buildProgress(courses[2], 1),
      completionPercentage: 17,
      paymentStatus: "free",
    },
    // Meera: course[1] – 10% done
    {
      student: students[3]._id,
      course: courses[1]._id,
      progress: buildProgress(courses[1], 1),
      completionPercentage: 14,
      paymentStatus: "paid",
      amountPaid: courses[1].price,
    },
    // Meera: course[2] (free) – 50% done
    {
      student: students[3]._id,
      course: courses[2]._id,
      progress: buildProgress(courses[2], Math.floor(totalLectures(courses[2]) * 0.5)),
      completionPercentage: 50,
      paymentStatus: "free",
    },
  ]);

  console.log(`📝 Created ${enrollments.length} enrollments`);

  // ── 4. Quizzes ─────────────────────────────────────────────────────────────
  const quizzes = await Quiz.create([
    {
      title: "JavaScript & React Basics Quiz",
      topic: "React",
      difficulty: "Easy",
      timeLimit: 10,
      createdBy: instructors[0]._id,
      questions: [
        {
          question: "Which hook is used to manage state in a React functional component?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: 1,
          explanation: "useState is the primary hook for managing local component state.",
        },
        {
          question: "What does the 'useEffect' hook do?",
          options: [
            "Manages component state",
            "Handles side effects like data fetching",
            "Provides context to child components",
            "Memoises a value",
          ],
          correctAnswer: 1,
          explanation: "useEffect lets you synchronize a component with an external system or run side effects.",
        },
        {
          question: "In JavaScript, which keyword declares a block-scoped variable?",
          options: ["var", "let", "function", "const"],
          correctAnswer: 1,
          explanation: "let declares block-scoped variables. const also does, but it's for constants.",
        },
        {
          question: "What is JSX?",
          options: [
            "A JavaScript framework",
            "A syntax extension that looks like HTML in JavaScript",
            "A CSS preprocessor",
            "A state management library",
          ],
          correctAnswer: 1,
          explanation: "JSX is syntactic sugar that lets you write HTML-like markup inside JavaScript.",
        },
        {
          question: "Which method is used to make a GET request with the Fetch API?",
          options: ["fetch.get()", "http.get()", "fetch(url)", "axios.get()"],
          correctAnswer: 2,
          explanation: "The global fetch(url) function defaults to a GET request.",
        },
      ],
      attempts: [
        { user: students[0]._id, score: 80, answers: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 3 }, xpEarned: 40 },
        { user: students[1]._id, score: 100, answers: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 2 }, xpEarned: 50 },
      ],
    },
    {
      title: "Python & Data Science Quiz",
      topic: "Data Science",
      difficulty: "Medium",
      timeLimit: 15,
      createdBy: instructors[1]._id,
      questions: [
        {
          question: "Which Pandas method displays the first 5 rows of a DataFrame?",
          options: ["df.tail()", "df.head()", "df.first()", "df.show()"],
          correctAnswer: 1,
          explanation: "df.head() returns the first n rows (default 5).",
        },
        {
          question: "What does NaN stand for in data analysis?",
          options: ["Not a Number", "Null and None", "No Available Number", "Negative and Null"],
          correctAnswer: 0,
          explanation: "NaN (Not a Number) represents missing or undefined numerical values.",
        },
        {
          question: "Which Scikit-Learn class implements Linear Regression?",
          options: [
            "sklearn.linear_model.LinearRegression",
            "sklearn.regression.Linear",
            "sklearn.model.Regression",
            "sklearn.linear.Model",
          ],
          correctAnswer: 0,
          explanation: "LinearRegression is in the linear_model module of scikit-learn.",
        },
        {
          question: "In a confusion matrix, what does 'precision' measure?",
          options: [
            "True positives / (true positives + false negatives)",
            "True positives / (true positives + false positives)",
            "True negatives / total predictions",
            "Correct predictions / total predictions",
          ],
          correctAnswer: 1,
          explanation: "Precision = TP / (TP + FP) – how many predicted positives are actually positive.",
        },
        {
          question: "Which NumPy function creates an array of zeros?",
          options: ["np.empty()", "np.zero()", "np.zeros()", "np.null()"],
          correctAnswer: 2,
          explanation: "np.zeros(shape) creates an array filled with zeros.",
        },
      ],
      attempts: [
        { user: students[1]._id, score: 80, answers: { 0: 1, 1: 0, 2: 0, 3: 1, 4: 2 }, xpEarned: 40 },
        { user: students[3]._id, score: 60, answers: { 0: 1, 1: 0, 2: 2, 3: 1, 4: 2 }, xpEarned: 30 },
      ],
    },
    {
      title: "UI/UX Design Principles Quiz",
      topic: "Design",
      difficulty: "Easy",
      timeLimit: 8,
      createdBy: instructors[0]._id,
      questions: [
        {
          question: "What does UX stand for?",
          options: ["User Experience", "UI Extension", "Universal Exchange", "Usability Expert"],
          correctAnswer: 0,
          explanation: "UX stands for User Experience — the overall experience a user has with a product.",
        },
        {
          question: "What is the purpose of a wireframe?",
          options: [
            "To add final colours and typography",
            "To outline the skeletal structure of a UI without visual design",
            "To write the final HTML code",
            "To test server performance",
          ],
          correctAnswer: 1,
          explanation: "Wireframes are low-fidelity blueprints that show layout and structure.",
        },
        {
          question: "Which design principle ensures important elements stand out?",
          options: ["Proximity", "Repetition", "Contrast", "Alignment"],
          correctAnswer: 2,
          explanation: "Contrast makes key elements visually distinct and easier to notice.",
        },
      ],
      attempts: [
        { user: students[0]._id, score: 100, answers: { 0: 0, 1: 1, 2: 2 }, xpEarned: 30 },
      ],
    },
  ]);

  console.log(`🧠 Created ${quizzes.length} quizzes`);

  // ── 5. Notifications ───────────────────────────────────────────────────────
  await Notification.create([
    // Enrollment notifications
    {
      user: students[0]._id,
      type: "enrollment",
      title: "Enrolled Successfully!",
      message: `You have been successfully enrolled in "${courses[0].title}". Happy learning!`,
      link: `/courses/${courses[0]._id}/learn`,
      isRead: true,
    },
    {
      user: students[0]._id,
      type: "achievement",
      title: "Course Completed! 🎉",
      message: `Congratulations! You completed "${courses[2].title}" and earned a certificate.`,
      link: `/certificates`,
      isRead: false,
    },
    {
      user: students[1]._id,
      type: "enrollment",
      title: "Enrolled Successfully!",
      message: `Welcome to "${courses[1].title}". Let's get started!`,
      link: `/courses/${courses[1]._id}/learn`,
      isRead: true,
    },
    {
      user: students[1]._id,
      type: "quiz_result",
      title: "Quiz Completed – Perfect Score!",
      message: `You scored 100% on "${quizzes[0].title}" and earned 50 XP!`,
      link: `/quizzes`,
      isRead: false,
      metadata: { quizId: quizzes[0]._id, score: 100, xpEarned: 50 },
    },
    {
      user: students[1]._id,
      type: "achievement",
      title: "Badge Earned: Streak Master 🔥",
      message: "You've maintained a 20-day learning streak. Keep it up!",
      isRead: false,
    },
    {
      user: students[2]._id,
      type: "enrollment",
      title: "Enrolled Successfully!",
      message: `You are now enrolled in "${courses[0].title}".`,
      link: `/courses/${courses[0]._id}/learn`,
      isRead: true,
    },
    // System notification for all students
    ...students.map((s) => ({
      user: s._id,
      type: "system",
      title: "New Feature: AI Quiz Generator",
      message:
        "You can now generate custom AI-powered quizzes on any topic. Try it from your dashboard!",
      link: "/quiz/generate",
      isRead: false,
    })),
    // Instructor notification
    {
      user: instructors[0]._id,
      type: "enrollment",
      title: "New Student Enrolled",
      message: `${students[2].name} enrolled in "${courses[0].title}".`,
      link: `/instructor/courses`,
      isRead: false,
      metadata: { studentId: students[2]._id, courseId: courses[0]._id },
    },
    {
      user: instructors[1]._id,
      type: "course_update",
      title: "Course Review Received ⭐",
      message: `${students[1].name} left a 5-star review on "${courses[1].title}".`,
      link: `/instructor/courses/${courses[1]._id}`,
      isRead: false,
    },
    // Admin notification about pending instructor
    {
      user: admin._id,
      type: "system",
      title: "Instructor Approval Pending",
      message: `${instructors[2].name} has applied to become an instructor and is awaiting approval.`,
      link: "/admin/users",
      isRead: false,
      metadata: { pendingInstructorId: instructors[2]._id },
    },
  ]);

  console.log("🔔 Created notifications");

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n✅ Database seeded successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Login credentials (password: password123)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Admin      : admin@learnkro.ai");
  console.log("  Instructor : priya@learnkro.ai  (approved)");
  console.log("  Instructor : arjun@learnkro.ai  (approved)");
  console.log("  Instructor : neha@learnkro.ai   (pending approval)");
  console.log("  Student    : ravi@example.com");
  console.log("  Student    : anjali@example.com");
  console.log("  Student    : vikram@example.com");
  console.log("  Student    : meera@example.com");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
