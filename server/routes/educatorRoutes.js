import express from "express";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator, protectRoute } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// Add Educator Role
educatorRouter.get("/update-role", protectRoute, updateRoleToEducator);
educatorRouter.post(
  "/add-course",
  upload.single("image"),
  protectRoute,
  protectEducator,
  addCourse
);
educatorRouter.get("/courses", protectRoute, protectEducator, getEducatorCourses);
educatorRouter.get("/dashboard", protectRoute, protectEducator, educatorDashboardData);
educatorRouter.get(
  "/enrolled-students",
  protectRoute,
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
