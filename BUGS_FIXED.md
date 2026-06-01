# Bug Fixes — LearnKro AI v2 Enhanced

## Critical Bug: Videos Not Showing

### Bug 1 — Backend: `getCourse` didn't check enrollment before hiding video URLs
**File:** `backend/controllers/course.controller.js`

**Problem:** The `getCourse` controller only showed `videoUrl` fields to users where `req.user` was truthy (i.e. any logged-in user). This meant enrolled students should have seen videos — but there was a deeper flaw: the endpoint stripped `videoPublicId` but returned all `videoUrl`s to any authenticated user without verifying enrollment. Worse, if the token wasn't properly sent or if the `optionalAuth` middleware didn't attach the user, ALL video URLs were stripped from the response, leaving `videoUrl: undefined` for every lecture — causing the player to show "No video" even for enrolled users.

**Fix:** Added proper enrollment check in `getCourse`:
- If user is the course instructor or an admin → show all video URLs
- If user is an enrolled student → show all video URLs  
- Otherwise → only show `videoUrl` for `isPreview: true` lectures

### Bug 2 — Frontend: `react-player/lazy` import caused player not to initialize
**File:** `frontend/src/pages/student/CourseLearnPage.jsx`

**Problem:** Using `import ReactPlayer from "react-player/lazy"` causes the player to lazy-load its sub-components. This can silently fail when bundled with Vite, resulting in an empty `<div>` with no video rendered — even with a valid URL.

**Fix:** Changed to the direct import:
```js
// Before (broken)
import ReactPlayer from "react-player/lazy";

// After (fixed)
import ReactPlayer from "react-player";
```

### Bug 3 — Frontend: `forceVideo: true` broke Cloudinary/HLS URLs
**File:** `frontend/src/pages/student/CourseLearnPage.jsx`

**Problem:** The `config.file.forceVideo: true` option in ReactPlayer forces the HTML5 `<video>` element and disables all other playback providers. This breaks Cloudinary videos that serve as HLS (`.m3u8`) streams, which require the HLS.js provider inside ReactPlayer.

**Fix:** Removed `forceVideo: true`. Added smart HLS detection:
```js
config={{
  file: {
    attributes: { crossOrigin: "anonymous" }, // Required for Cloudinary CORS
    forceVideo: false,
    forceHLS: activeLecture.videoUrl?.includes(".m3u8"),
  },
}}
```

### Bug 4 — Backend: Cloudinary `uploadVideo` used async eager HLS as primary URL
**File:** `backend/config/cloudinary.js`

**Problem:** The `uploadVideo` function specified `eager: [{ streaming_profile: "hd", format: "m3u8" }]` with `eager_async: true`. With async eager transformations, the `.m3u8` URL is not ready immediately after upload. However the code was storing `result.secure_url` (the raw mp4 URL), which is correct — but if anyone tried to use `result.eager[0].secure_url` for HLS they'd get a URL that isn't ready yet.

**Fix:** Removed the eager HLS transformation entirely. The direct `secure_url` (mp4) returned by Cloudinary works immediately and is fully supported by ReactPlayer without any extra configuration.

### Bug 5 — Frontend: Missing `playerReady` / `playerError` states caused bad UX
**File:** `frontend/src/pages/student/CourseLearnPage.jsx`

**Problem:** No loading or error state was tracked on the video player. If the video failed to load, the player showed a blank black rectangle with no feedback.

**Fix:** Added:
- `playerReady` state — shows a spinner overlay until the player fires `onReady`
- `playerError` state — shows an error overlay with a retry button when `onError` fires
- Player states reset when switching lectures

### Bug 6 — Frontend: Stale closure in `handleVideoEnd` / `isLectureCompleted`
**File:** `frontend/src/pages/student/CourseLearnPage.jsx`

**Problem:** `isLectureCompleted` read from `enrollment` state inside a `useCallback` without listing `enrollment` as a dependency, causing it to always read the stale initial value (`undefined`). This meant `handleVideoEnd` would always re-mark lectures as complete even if they were already done, triggering unnecessary API calls.

**Fix:** Used a `useRef` to keep a mutable reference to `enrollment` that's always current:
```js
const enrollmentRef = useRef(enrollment);
useEffect(() => { enrollmentRef.current = enrollment; }, [enrollment]);

const isLectureCompleted = useCallback((lectureId) =>
  enrollmentRef.current?.progress?.some((p) => p.lecture === lectureId && p.completed),
  []
);
```

### Bug 7 — Frontend: `controlsList: "nodownload"` can conflict with non-HTML5 players
**File:** `frontend/src/pages/student/CourseLearnPage.jsx`

**Problem:** `controlsList: "nodownload"` is an HTML5 `<video>` attribute. When ReactPlayer uses HLS.js or other providers, passing this attribute can cause warnings and, in some browsers, break the controls entirely.

**Fix:** Removed `controlsList` from the config. The `crossOrigin: "anonymous"` attribute was added instead to ensure proper CORS handling for Cloudinary URLs.
