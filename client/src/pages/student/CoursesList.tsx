import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/student/SearchBar";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import CourseCard from "../../components/student/CourseCard";
import { assets, type dummyCourses } from "../../assets/assets";
import Footer from "../../components/student/Footer";
type Course = (typeof dummyCourses)[0];

const CoursesList = () => {
  const navigate = useNavigate();
  const { input } = useParams<{ input?: string }>();
  const { allCourses = [] } = useContext(AppContext) || {};

  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">
        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">
              Course List
            </h1>
            <p className="text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </span>{" "}
              / <span>Course List</span>
            </p>
          </div>
          <SearchBar data={input} />
        </div>
        {input && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600">
            <p>{input}</p>
            <img
              src={assets.cross_icon}
              alt=""
              className="cursor-pointer"
              onClick={() => navigate("/course-list")}
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">
          {allCourses
            .filter((course: Course) =>
              input
                ? course.courseTitle.toLowerCase().includes(input.toLowerCase())
                : true
            )
            .map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CoursesList;
