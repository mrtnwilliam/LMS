// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  // Add other user fields as needed
}

// Lecture types
export interface Lecture {
  lectureId: string;
  lectureTitle: string;
  lectureDuration: number;
  lectureUrl: string;
  isPreviewFree: boolean;
  lectureOrder: number;
}

// Chapter types
export interface Chapter {
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  chapterContent: Lecture[];
  collapsed: boolean;
}

// Course Rating
export interface CourseRating {
  userId: string;
  rating: number;
}

// Main Course type
export interface CourseBase {
  _id: string;
  courseTitle: string;
  courseDescription: string;
  courseThumbnail: string;
  coursePrice: number;
  isPublished: boolean;
  discount: number;
  courseContent: Chapter[];
  courseRatings: CourseRating[];
  educator: User | string;
  enrolledStudents: string[] | User[]; // Can be array of IDs or populated Users
  createdAt?: string;
  updatedAt?: string;
}

export interface Course extends CourseBase {
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Context types
export interface AppContextType {
  currency: string;
  calculateRating: (course: Course) => number;
  // Add other context properties as needed
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
  enrolledCourses: string[]; // ObjectIds come as strings
  createdAt: string;         // timestamps converted to ISO strings
  updatedAt: string;
}

export interface CourseProgress {
  lectureCompleted: string[];
}

export interface AppContextValue {
  currency: string;
  allCourses: Course[];
  calculateRating: (course: Course) => number;
  calculateNoOfLectures: (course: Course) => number;
  calculateCourseDuration: (course: Course) => string;
  calculateChapterTime: (chapter: Chapter) => string;
  isEducator: boolean;
  setIsEducator: React.Dispatch<React.SetStateAction<boolean>>;
  enrolledCourses: Course[];
  backendUrl: string;
  getToken: () => Promise<string | null>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
  setEnrolledCourses: React.Dispatch<React.SetStateAction<Course[]>>
  fetchUserEnrolledCourses: () => void;
  fetchAllCourses: () => Promise<void>;
  fetchUserData: () => Promise<void>;
}

// Dashboard Types
export interface StudentPreview {
  _id: string;
  name: string;
  imageUrl: string;
}

export interface EnrolledStudentData {
  courseTitle: string;
  student: StudentPreview;
}

export interface DashboardData {
  totalEarnings: number;
  enrolledStudentsData: EnrolledStudentData[];
  totalCourses: number;
}