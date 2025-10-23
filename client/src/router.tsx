import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Home },
      { path: "/course-list", Component: CoursesList },
      { path: "/course-list/:input", Component: CoursesList },
      { path: "/course/:id", Component: CourseDetails },
      { path: "/my-enrollments", Component: MyEnrollments },
      { path: "/player/:courseId", Component: Player },
      { path: "/loading/:path", Component: Loading },
      {
        path: "/educator",
        Component: Educator,
        children: [
          { index: true, Component: Dashboard },
          { path: "add-course", Component: AddCourse },
          { path: "my-courses", Component: MyCourses },
          { path: "students-enrolled", Component: StudentsEnrolled },
        ],
      },
    ],
  },
]);
