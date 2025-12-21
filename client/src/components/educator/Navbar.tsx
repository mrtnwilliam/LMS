import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function Navbar() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext must be used within AppContextProvider");
  const { userData, backendUrl, setUserData, setEnrolledCourses } = context;
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
        const {data} = await axios.post(`${backendUrl}/api/auth/logout`);
        if(data.success){
            setUserData(null);
            setEnrolledCourses([]);
            navigate('/');
        } else {
          toast.error(data.message);
        }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
      <Link to='/'>
        <img src={assets.logo} alt="logo" className="w-28 lg:w-32" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {userData ? userData.name : 'Developers'}</p>
        {userData ? (
             <div className="group relative">
                <button className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 flex justify-center items-center rounded-full bg-blue-600 text-white relative group">
                        {userData.name[0].toUpperCase()}
                    </div>
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-10">
                    <div className="bg-white shadow-lg rounded-md overflow-hidden border">
                        <button onClick={logoutHandler} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer">Logout</button>
                    </div>
                </div>
            </div>
        ) : <img className="max-w-8" src={assets.profile_img} alt="" />}
      </div>
    </div>
  );
}

export default Navbar;
