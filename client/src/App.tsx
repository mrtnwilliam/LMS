import { Outlet, useLocation } from "react-router";
import Navbar from "./components/student/Navbar";
import "quill/dist/quill.snow.css";

const App = () => {

  const location = useLocation();
  const isEducatorRoute = location.pathname.startsWith('/educator');

  return (
    <div className="text-default min-h-screen bg-white">
      {!isEducatorRoute && <Navbar/>}
      <Outlet />
    </div>
  );
};

export default App;
