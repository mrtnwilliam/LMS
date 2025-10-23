import { Link, useNavigate } from "react-router";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {

  const navigate = useNavigate();
  const isCourseListPage = location.pathname.includes('/course-list');
  const context = useContext(AppContext)
  const isEducator = context!.isEducator

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? "bg-white" : "bg-cyan-100/70"}`}>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/educator')}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>|{" "}
          <Link to="/my-enrollments">My Enrollments</Link>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full">Create Account</button>
      </div>
      {/* For Phone Screens */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div>
          <button onClick={() => navigate('/educator')}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>|{" "}
          <Link to="/my-enrollments">My Enrollments</Link>
        </div>
        <button><img src={assets.user_icon} alt="" /></button>
      </div>
    </div>
  );
};

export default Navbar;
