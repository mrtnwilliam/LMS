import { Link, useNavigate } from "react-router";
import { assets } from "../../assets/assets";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../modals/Modal";
import ModalInput from "../modals/ModalInput";

const Navbar = () => {
  const navigate = useNavigate();
  const isCourseListPage = location.pathname.includes("/course-list");
  const context = useContext(AppContext);
  if (!context)
    throw new Error("AppContext must be used within AppContextProvider");
  const { backendUrl, getToken, isEducator, setIsEducator } = context;

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [authModal, setAuthModal] = useState<
    null | "signup" | "signin" | "forgotPass" | "resetPass" | "otp"
  >("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [confirmPassTouched, setConfirmPassTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const hasSignupErrors =
  name === "" ||
  email === "" ||
  password === "" ||
  confirmPass !== password;

  const hasLoginErrors = email === '' || password === '';
  const hasForgotPasswordErrors = email === '';
  const hasResetPasswordErrors = password === '' || confirmPass !== password;

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + "/api/educator/update-role",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setIsEducator(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <>
      <div
        className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
          isCourseListPage ? "bg-white" : "bg-cyan-100/70"
        }`}
      >
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="Logo"
          className="w-28 lg:w-32 cursor-pointer"
        />
        <div className="hidden md:flex items-center gap-5 text-gray-500">
          <div className="flex items-center gap-5">
            {user && (
              <>
                <button className="cursor-pointer" onClick={becomeEducator}>
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            )}
          </div>
          {user ? (
            <UserButton />
          ) : (
            <button
              onClick={() => openSignIn()}
              className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Create Account
            </button>
          )}
        </div>
        {/* For Phone Screens */}
        <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
          <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
            {user && (
              <>
                <button className="cursor-pointer" onClick={becomeEducator}>
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            )}
          </div>
          {user ? (
            <UserButton />
          ) : (
            <button onClick={() => openSignIn()} className="cursor-pointer">
              <img src={assets.user_icon} alt="" />
            </button>
          )}
        </div>
      </div>
      {/* Signup */}
      <Modal
        isOpen={authModal === "signup"}
        title="Sign Up"
        onClose={() => setAuthModal(null)}
      >
        <ModalInput
          label="Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setNameTouched(true)}
          error="Name is required"
          showError={nameTouched && name === ''}
        />
        <ModalInput
          label="Email"
          name="email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          error="Email is required."
          showError={emailTouched && email === ''}
        />
        <ModalInput
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          error="Password is required"
          showError={passwordTouched && password === ''}
        />
        <ModalInput
          label="Confirm Password"
          name="confirmPass"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          onBlur={() => setConfirmPassTouched(true)}
          type="password"
          error="Must match the first password input field."
          showError={confirmPassTouched && confirmPass !== password}
        />
        <button
          className={`w-full ${hasSignupErrors ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer"} text-white px-4 py-2 rounded mt-3.5`}
          onClick={() => {if (hasSignupErrors) return; setAuthModal("otp"); setName(""); setEmail(''); setPassword(''); setConfirmPass(''); setNameTouched(false); setEmailTouched(false); setPasswordTouched(false); setConfirmPassTouched(false)}}
          disabled={hasSignupErrors}
        >
          Sign Up
        </button>
        <p className="text-gray-500 text-center text-xs mt-4">
          Already have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer underline"
            onClick={() => {setAuthModal("signin"); setName(""); setEmail(''); setPassword(''); setConfirmPass(''); setNameTouched(false); setEmailTouched(false); setPasswordTouched(false); setConfirmPassTouched(false)}}
          >
            Login here
          </span>
        </p>
      </Modal>
      {/* Signin */}
      <Modal
        isOpen={authModal === "signin"}
        onClose={() => setAuthModal(null)}
        title="Sign In"
      >
        <ModalInput
          label="Email"
          name="email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          error="Email is required."
          showError={emailTouched && email === ''}
        />
        <ModalInput
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          error="Password is required"
          showError={passwordTouched && password === ''}
        />
        <p
          onClick={() => {setAuthModal("forgotPass"); setEmail(''); setPassword('');setEmailTouched(false); setPasswordTouched(false);}}
          className="text-blue-400 underline cursor-pointer"
        >
          Forgot password?
        </p>
        <button 
          className={`w-full ${hasLoginErrors ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer"} text-white px-4 py-2 rounded mt-3`}
          disabled={hasLoginErrors}
          onClick={() => {if (hasLoginErrors) return; setEmail(''); setPassword('');setEmailTouched(false); setPasswordTouched(false);}}
        >
          Sign In
        </button>
        <p className="text-gray-500 text-center text-xs mt-4">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer underline"
            onClick={() => {setAuthModal("signup"); setEmail(''); setPassword('');setEmailTouched(false); setPasswordTouched(false);}}
          >
            Sign Up
          </span>
        </p>
      </Modal>
      {/* Email verify OTP */}
      <Modal
        isOpen={authModal === "otp"}
        onClose={() => setAuthModal(null)}
        title="Email Verify OTP"
      >
        <p className="text-center mb-6 text-gray-500">
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <input
                name="otp"
                type="text"
                maxLength={1}
                key={i}
                required
                className="w-11 h-11 border-1 border-[#333A5C] text-gray-700 text-center text-xl rounded-md"
                // ref={(e) => {
                //   inputRefs.current[i] = e;
                // }}
                onInput={(e) => handleInput(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              />
            ))}
        </div>
        <button className="w-full py-3 bg-blue-400  text-white rounded-full">
          Verify Email
        </button>
      </Modal>
      {/* Forgot Password */}
      <Modal
        isOpen={authModal === "forgotPass"}
        title="Forgot Password"
        onClose={() => setAuthModal(null)}
      >
        <ModalInput
          label="Email"
          name="email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          error="Email is required."
          showError={emailTouched && email === ''}
        />
        <button
          className={`w-full py-3 ${hasForgotPasswordErrors ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer"}  text-white rounded-full mt-2`}
          onClick={() => {if (hasForgotPasswordErrors) return; setAuthModal("resetPass"); setEmail(''); setEmailTouched(false)}}
          disabled={hasForgotPasswordErrors}
        >
          Send Email
        </button>
      </Modal>
      {/* Reset Password */}
      <Modal
        isOpen={authModal === "resetPass"}
        title="Reset Password"
        onClose={() => setAuthModal(null)}
      >
        <ModalInput
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          error="Password is required"
          showError={passwordTouched && password === ''}
        />
        <ModalInput
          label="Confirm Password"
          name="confirmPass"
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          error="Must match the first password input field."
          onBlur={() => setConfirmPassTouched(true)}
          showError={confirmPassTouched && confirmPass !== password}
        />
        <button
          className={`w-full py-3 ${hasResetPasswordErrors ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer"} text-white rounded-full mt-2`}
          onClick={() => {if (hasResetPasswordErrors) return; setAuthModal("signin"); setPassword(''); setConfirmPass(''); setPasswordTouched(false); setConfirmPassTouched(false)}}
          disabled={hasResetPasswordErrors}
        >
          Reset
        </button>
      </Modal>
    </>
  );
};

export default Navbar;
