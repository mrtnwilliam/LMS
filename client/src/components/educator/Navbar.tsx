import { Link } from "react-router-dom";
import { assets, dummyEducatorData } from "../../assets/assets";

function Navbar() {
  const educatorData = dummyEducatorData;
  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
      <Link to='/'>
        <img src={assets.logo} alt="logo" className="w-28 lg:w-32" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! Developers</p>
        <img className="max-w-8" src={assets.profile_img} alt="" />
      </div>
    </div>
  );
}

export default Navbar;
