import { Link, useNavigate } from "react-router";
import { assets } from "../../assets/assets";
import {
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../modals/Modal";
import ModalInput from "../modals/ModalInput";

type AuthModalType =
  | null
  | "signup"
  | "signin"
  | "forgotPass"
  | "resetPass"
  | "otpSignup"
  | "otpForgot";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPass: string;
  // touched flags
  touched: {
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPass: boolean;
  };
};

type Action =
  | {
      type: "SET_FIELD";
      field: keyof Omit<FormState, "touched">;
      value: string;
    }
  | { type: "SET_TOUCHED"; field: keyof FormState["touched"]; value: boolean }
  | { type: "RESET" }
  | { type: "SET_ALL"; payload: Partial<FormState> };

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPass: "",
  touched: { name: false, email: false, password: false, confirmPass: false },
};

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_TOUCHED":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: action.value },
      };
    case "RESET":
      return initialFormState;
    case "SET_ALL":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const Navbar = () => {
  const navigate = useNavigate();
  const isCourseListPage = location.pathname.includes("/course-list");
  const context = useContext(AppContext);
  if (!context)
    throw new Error("AppContext must be used within AppContextProvider");
  const { backendUrl, isEducator, setIsEducator, userData, setUserData, fetchUserData, setEnrolledCourses } = context;


  /* form reducer to centralize fields and touched flags */
  const [form, dispatch] = useReducer(reducer, initialFormState);

  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const hasSignupErrors = useMemo(() => {
    return (
      form.name.trim() === "" ||
      form.email.trim() === "" ||
      form.password === "" ||
      form.confirmPass !== form.password
    );
  }, [form]);

  const hasLoginErrors = useMemo(
    () => form.email.trim() === "" || form.password === "",
    [form]
  );
  const hasForgotPasswordErrors = useMemo(
    () => form.email.trim() === "",
    [form]
  );
  const hasResetPasswordErrors = useMemo(
    () => form.password === "" || form.confirmPass !== form.password,
    [form]
  );

  const resetForm = useCallback(() => dispatch({ type: "RESET" }), []);

  const becomeEducator = useCallback(async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
      const { data } = await axios.get(
        backendUrl + "/api/educator/update-role"
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
  }, [backendUrl, isEducator, navigate, setIsEducator]);

  const signUpHandler = async () => {
     try {
       const {data} = await axios.post(`${backendUrl}/api/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password
       });

       if (data.success || data.isUnverified) {
         setAuthModal("otpSignup");
         toast.success(data.message);
       } else {
         toast.error(data.message);
       }
     } catch (error) {
       toast.error((error as Error).message);
     }
  }

  const loginHandler = async () => {
    try {
      const {data} = await axios.post(`${backendUrl}/api/auth/login`, {
        email: form.email,
        password: form.password
      });

      if (data.success) {
        await fetchUserData();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  const verifyEmailHandler = async (otp: string) => {
    try {
        const {data} = await axios.post(`${backendUrl}/api/auth/verify-account`, {
            email: form.email,
            otp
        });
        if (data.success) {
             await fetchUserData();
             closeModal();
             toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error((error as Error).message);
    }
  }

  const sendResetOtpHandler = async () => {
    try {
        const {data} = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, {
            email: form.email
        });
        if(data.success){
            setAuthModal("otpForgot");
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error((error as Error).message);
    }
  }


   // Handling Reset Password Flow State
   const [resetOtp, setResetOtp] = useState("");

   const verifyResetOtpHandler = (otp: string) => {
       setResetOtp(otp); // Store OTP
       setAuthModal('resetPass'); // Move to password input
   }

   const submitResetPassword = async () => {
       try {
           const {data} = await axios.post(`${backendUrl}/api/auth/reset-password`, {
               email: form.email,
               otp: resetOtp,
               newPassword: form.password
           });
           if(data.success){
               closeModal();
               toast.success(data.message);
               openModal('signin');
           } else {
               toast.error(data.message);
           }
       } catch (error) {
         toast.error((error as Error).message);
       }
   }
  
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


  /* OTP logic: six single-character inputs with keyboard navigation & paste support */
  const OTP_LENGTH = 6;
  const [otpValues, setOtpValues] = useState<string[]>(() =>
    Array(OTP_LENGTH).fill("")
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleOtpInput = (
    e: React.FormEvent<HTMLInputElement>,
    idx: number
  ) => {
    const value = (e.currentTarget.value || "").slice(-1);
    setOtpValues((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
    if (value && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const { key } = e;
    if (key === "Backspace") {
      if (otpValues[idx]) {
        setOtpValues((prev) => {
          const arr = [...prev];
          arr[idx] = "";
          return arr;
        });
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus();
      }
    } else if (key === "ArrowLeft" && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    } else if (key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    const chars = paste.split("");
    setOtpValues((prev) => {
      const arr = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) {
        arr[i] = chars[i] ?? "";
      }
      return arr;
    });
    // focus last pasted index
    const lastIndex = Math.min(chars.length - 1, OTP_LENGTH - 1);
    if (lastIndex >= 0) otpRefs.current[lastIndex]?.focus();
    e.preventDefault();
  };

  /* Generic handlers for form fields */
  const setField = useCallback(
    (field: keyof Omit<FormState, "touched">, value: string) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );
  const setTouched = useCallback(
    (field: keyof FormState["touched"], value: boolean) => {
      dispatch({ type: "SET_TOUCHED", field, value });
    },
    []
  );
  const openModal = useCallback(
    (modal: AuthModalType) => {
      setAuthModal(modal);
      resetForm();
      setOtpValues(Array(OTP_LENGTH).fill(""));
    },
    [resetForm]
  );
  const closeModal = useCallback(() => {
    setAuthModal(null);
    resetForm();
    setOtpValues(Array(OTP_LENGTH).fill(""));
  }, [resetForm]);

  /* Render modals in one place to avoid duplication */
  const renderAuthModal = () => {
    return (
      <>
        {/* Signup */}
        <Modal
          isOpen={authModal === "signup"}
          title="Sign Up"
          onClose={closeModal}
        >
          <ModalInput
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => setTouched("name", true)}
            error="Name is required"
            showError={form.touched.name && form.name.trim() === ""}
          />
          <ModalInput
            label="Email"
            name="email"
            value={form.email}
            type="email"
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => setTouched("email", true)}
            error="Email is required."
            showError={form.touched.email && form.email.trim() === ""}
          />
          <ModalInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            onBlur={() => setTouched("password", true)}
            error="Password is required"
            showError={form.touched.password && form.password === ""}
          />
          <ModalInput
            label="Confirm Password"
            name="confirmPass"
            value={form.confirmPass}
            onChange={(e) => setField("confirmPass", e.target.value)}
            onBlur={() => setTouched("confirmPass", true)}
            type="password"
            error="Must match the first password input field."
            showError={
              form.touched.confirmPass && form.confirmPass !== form.password
            }
          />
          <button
            className={`w-full ${
              hasSignupErrors
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 cursor-pointer"
            } text-white px-4 py-2 rounded mt-3.5`}
            onClick={() => {
              if (hasSignupErrors) return;
              signUpHandler();
            }}
            disabled={hasSignupErrors}
          >
            Sign Up
          </button>
          <p className="text-gray-500 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
              onClick={() => {
                openModal("signin");
              }}
            >
              Login here
            </span>
          </p>
        </Modal>
        {/* Signin */}
        <Modal
          isOpen={authModal === "signin"}
          onClose={closeModal}
          title="Sign In"
        >
          <ModalInput
            label="Email"
            name="email"
            value={form.email}
            type="email"
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => setTouched("email", true)}
            error="Email is required."
            showError={form.touched.email && form.email.trim() === ""}
          />
          <ModalInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            onBlur={() => setTouched("password", true)}
            error="Password is required"
            showError={form.touched.password && form.password === ""}
          />
          <p
            onClick={() => {
              openModal("forgotPass");
            }}
            className="text-blue-400 underline cursor-pointer"
          >
            Forgot password?
          </p>
          <button
            className={`w-full ${
              hasLoginErrors
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 cursor-pointer"
            } text-white px-4 py-2 rounded mt-3`}
            disabled={hasLoginErrors}
            onClick={() => {
              if (hasLoginErrors) return;
              loginHandler();
            }}
          >
            Sign In
          </button>
          <p className="text-gray-500 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
              onClick={() => {
                openModal("signup");
              }}
            >
              Sign Up
            </span>
          </p>
        </Modal>
        {/* Email verify OTP */}
        <Modal
          isOpen={authModal === "otpSignup" || authModal === "otpForgot"}
          onClose={closeModal}
          title={
            authModal === "otpSignup"
              ? "Email Verify OTP"
              : "Enter OTP to Reset Password"
          }
        >
          <p className="text-center mb-6 text-gray-500">
            {authModal === "otpSignup"
              ? "Enter the 6-digit code sent to your email to verify your account."
              : "Enter the 6-digit code sent to your email to proceed with password reset."}
          </p>
          <div className="flex justify-between mb-8">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                name="otp"
                type="text"
                maxLength={1}
                value={otpValues[i]}
                key={i}
                required
                className="w-11 h-11 border-1 border-[#333A5C] text-gray-700 text-center text-xl rounded-md"
                // ref={(e) => {
                //   inputRefs.current[i] = e;
                // }}
                onInput={(e) =>
                  handleOtpInput(e as React.FormEvent<HTMLInputElement>, i)
                }
                onKeyDown={(e) =>
                  handleOtpKeyDown(
                    e as React.KeyboardEvent<HTMLInputElement>,
                    i
                  )
                }
                onPaste={handleOtpPaste}
              />
            ))}
          </div>
          <button
            className="w-full py-3 bg-blue-400  text-white rounded-full"
            onClick={() => {
                const otp = otpValues.join("");
              if (authModal === "otpForgot") {
                verifyResetOtpHandler(otp);
              } else {
                verifyEmailHandler(otp);
              }
            }}
          >
            Verify
          </button>
        </Modal>
        {/* Forgot Password */}
        <Modal
          isOpen={authModal === "forgotPass"}
          title="Forgot Password"
          onClose={closeModal}
        >
          <ModalInput
            label="Email"
            name="email"
            value={form.email}
            type="email"
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => setTouched("email", true)}
            error="Email is required."
            showError={form.touched.email && form.email.trim() === ""}
          />
          <button
            className={`w-full py-3 ${
              hasForgotPasswordErrors
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 cursor-pointer"
            }  text-white rounded-full mt-2`}
            onClick={() => {
              if (hasForgotPasswordErrors) return;
              sendResetOtpHandler();
            }}
            disabled={hasForgotPasswordErrors}
          >
            Send Email
          </button>
        </Modal>
        {/* Reset Password */}
        <Modal
          isOpen={authModal === "resetPass"}
          title="Reset Password"
          onClose={closeModal}
        >
          <ModalInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            onBlur={() => setTouched("password", true)}
            error="Password is required"
            showError={form.touched.password && form.password === ""}
          />
          <ModalInput
            label="Confirm Password"
            name="confirmPass"
            type="password"
            value={form.confirmPass}
            onChange={(e) => setField("confirmPass", e.target.value)}
            error="Must match the first password input field."
            onBlur={() => setTouched("confirmPass", true)}
            showError={
              form.touched.confirmPass && form.confirmPass !== form.password
            }
          />
          <button
            className={`w-full py-3 ${
              hasResetPasswordErrors
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 cursor-pointer"
            } text-white rounded-full mt-2`}
            onClick={() => {
              if (hasResetPasswordErrors) return;
              submitResetPassword();
            }}
            disabled={hasResetPasswordErrors}
          >
            Reset
          </button>
        </Modal>
      </>
    );
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
            {userData && (
              <>
                <button className="cursor-pointer" onClick={becomeEducator}>
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            )}
          </div>
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
          ) : (
            <>
            <button
              onClick={() =>openModal("signin")}
              className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Sign in
            </button>
             <button
              onClick={() => openModal("signup")}
              className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Create Account
            </button>
            </>
          )}
        </div>
        {/* For Phone Screens */}
        <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
          <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
            {userData && (
              <>
                <button className="cursor-pointer" onClick={becomeEducator}>
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            )}
          </div>
          {userData ? (
             <div className="group relative">
                <button
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <div className="w-8 h-8 flex justify-center items-center rounded-full bg-blue-600 text-white relative">
                        {userData.name[0].toUpperCase()}
                    </div>
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 top-full pt-2 w-48 z-10 transition-all duration-200 opacity-100">
                         <div className="bg-white shadow-lg rounded-md overflow-hidden border">
                            <button
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    logoutHandler();
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                            >
                                Logout
                            </button>
                         </div>
                    </div>
                )}
            </div>
          ) : (
            <div className="group relative">
               <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="cursor-pointer">
                 <img src={assets.user_icon} alt="" />
               </button>
               {isUserMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 w-48 z-10 transition-all duration-200 opacity-100">
                    <div className="bg-white shadow-lg rounded-md overflow-hidden border">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openModal("signin");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openModal("signup");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {renderAuthModal()}
    </>
  );
};

export default Navbar;
