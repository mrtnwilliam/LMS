import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import type { AppContextValue, Chapter, Course, UserData } from "../types";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextValue | undefined>(undefined);

type AppContextProviderProps = {
  children: ReactNode;
};

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const {getToken} = useAuth();
  const {user} = useUser()

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch All Courses
  const fetchAllCourses = async () => {
    try {
      const {data} = await axios.get(`${backendUrl}/api/course/all`);

      if (data.success) {
        setAllCourses(data.courses)
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error((error as Error).message)
    }
  };

  // Fetch UserData
  const fetchUserData = async() => {

    if (user?.publicMetadata.role === 'educator') {
      setIsEducator(true);
    }

    try {
      const token = await getToken();
      const {data} = await axios.get(backendUrl + '/api/user/data' , {headers: {Authorization: `Bearer ${token}`}})

      if (data.success) {
        setUserData(data.user)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  // Function to calculate average rating of course
  const calculateRating = (course: Course) =>
    course.courseRatings.length === 0
      ? 0
      : Math.floor(course.courseRatings.reduce((sum, r) => sum + r.rating, 0) /
        course.courseRatings.length);

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
      try {
        const token = await getToken();
        const {data} = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (data.success) {
          setEnrolledCourses(data.enrolledCourses.reverse());
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error((error as Error).message)
      }
    }

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(()=>{
    if (user) {
      fetchUserData()
      fetchUserEnrolledCourses()
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
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
