import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";

type Course = (typeof dummyCourses)[0];
type Chapter = Course["courseContent"][0];

interface AppContextValue {
  currency: string;
  allCourses: Course[];
  calculateRating: (course: Course) => number;
  calculateNoOfLectures: (course: Course) => number;
  calculateCourseDuration: (course: Course) => string;
  calculateChapterTime: (chapter: Chapter) => string;
  isEducator: boolean;
  setIsEducator: React.Dispatch<React.SetStateAction<boolean>>;
  enrolledCourses: Course[];
  fetchUserEnrolledCourses: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextValue | undefined>(undefined);

type AppContextProviderProps = {
  children: ReactNode;
};

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const {getToken} = useAuth();
  const {user} = useUser()

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  // Fetch All Courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  // Function to calculate average rating of course
  const calculateRating = (course: Course) =>
    course.courseRatings.length === 0
      ? 0
      : course.courseRatings.reduce((sum, r) => sum + r.rating, 0) /
        course.courseRatings.length;

  // Function to Calculate Course Chapter Time
  const calculateChapterTime = (chapter: Chapter) => {
    const time = chapter.chapterContent.reduce(
      (sum, lecture) => sum + lecture.lectureDuration,
      0
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to Calculate Course Duration
  const calculateCourseDuration = (course: Course) => {
    const time =
      course.courseContent
        .flatMap((ch) => ch.chapterContent)
        .reduce((total, lec) => total + lec.lectureDuration, 0) *
      60 *
      1000;
    return humanizeDuration(time, { units: ["h", "m"] });
  };

  // Function calculate No of lectures in the course
  const calculateNoOfLectures = (course: Course) =>
    course.courseContent.reduce(
      (total, chapter) =>
        total +
        (Array.isArray(chapter.chapterContent)
          ? chapter.chapterContent.length
          : 0),
      0
    );

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
      setEnrolledCourses(dummyCourses)
    }

  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses()
  }, []);

  const logToken = async () => {
    console.log(await getToken())
  }

  useEffect(()=>{
    if (user) {
      logToken()
    }
  },[user])

  const value: AppContextValue = {
    currency,
    allCourses,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses,
    fetchUserEnrolledCourses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
