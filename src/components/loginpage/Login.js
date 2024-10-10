import React, { useState } from "react";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../store/auth";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loader
    setErrors({ email: "", password: "", general: "" });

    // Client-side validation
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      setIsSubmitting(false);
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      setIsSubmitting(false);
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      // Store token and user details in localStorage
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      // Handle navigation based on user role
      if (data.user.role === "admin") {
        navigate("/admin-panel");
        // navigate('/admin-verify-otp');
      } else if (data.user.selfDeclaration === true) {
        navigate("/employee-panel");
      } else {
        navigate("/self-declaration");
      }
      setSuccessMessage("Login successful");
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error.response) {
        // Handle known API errors
        const errorMessage = error.response.data.message || "An error occurred";

        if (errorMessage === "Otp required for login. Please contact admin.") {
          // Set the error message
          setErrors((prev) => ({
            ...prev,
            general:
              "Yesterday your working was not complete for 6 hours. Please verify your account.",
          }));

          // Stop the loader
          setIsSubmitting(false);

          // Delay for 3 seconds before redirecting to the OTP verification page
          setTimeout(() => {
            navigate("/admin-verify-otp", { state: { email: email } });
          }, 3000);
          return;
        }

        if (errorMessage.toLowerCase().includes("password")) {
          setErrors((prev) => ({ ...prev, password: "Incorrect password" }));
        } else if (errorMessage.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: "Email not found" }));
        } else {
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      } else {
        // Handle unexpected errors
        setErrors((prev) => ({
          ...prev,
          general: "An unexpected error occurred",
        }));
      }
    } finally {
      setIsSubmitting(false); // Stop loader
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgotPassword");
  };

  const handleGoogleLoginSuccess = async (response) => {
    const token = response.credential;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.data;

      // Handle successful login, e.g., save token to local storage, redirect, etc.
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      // Handle navigation based on user role
      if (data.user.role === "admin") {
        navigate("/admin-panel");
        // navigate('/admin-verify-otp');
      } else if (data.user.selfDeclaration === true) {
        navigate("/employee-panel");
      } else {
        navigate("/self-declaration");
      }
      setSuccessMessage("Login successful");
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error.response) {
        // Handle known API errors
        const errorMessage = error.response.data.message || "An error occurred";

        if (errorMessage === "Otp required for login. Please contact admin.") {
          // Set the error message
          setErrors((prev) => ({
            ...prev,
            general:
              "Yesterday your working was not complete for 6 hours. Please verify your account.",
          }));

          // Stop the loader
          setIsSubmitting(false);

          // Delay for 3 seconds before redirecting to the OTP verification page
          setTimeout(() => {
            navigate("/admin-verify-otp", { state: { email: email } });
          }, 3000);
          return;
        }

        if (errorMessage.toLowerCase().includes("password")) {
          setErrors((prev) => ({ ...prev, password: "Incorrect password" }));
        } else if (errorMessage.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: "Email not found" }));
        } else {
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      } else {
        // Handle unexpected errors
        setErrors((prev) => ({
          ...prev,
          general: "An unexpected error occurred",
        }));
      }
    } finally {
      setIsSubmitting(false); // Stop loader
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google Login failed", error);
  };

  return (
    <>
      <div className="w-full flex flex-col md:flex-row sm:flex-row min-h-screen font-montserrat mb-20 sm:mb-5">
        <div className="w-full md:w-1/2 h-screen bgimage bg-cover bg-center relative bg-no-repeat mb-0 md:mb-10">
          <div className="logo absolute top-8 left-1/2 transform -translate-x-1/2 w-[50vh] h-[14vh] bg-contain bg-no-repeat"></div>
        </div>
        <div className="flex w-full md:w-1/2 flex-col justify-center items-center p-4 md:p-8">
          <div className="relative flex flex-col items-center w-full">
            <div className="flex justify-between items-center w-full">
              <div className="flex-grow"></div>
              <div className="plane-icon absolute w-40 md:w-[50%] sm:w-30 md:h-60 bg-contain bg-no-repeat -mb-[20vh] right-0 md:right-[-60px] xl:right-[-80px] 2xl:right-[-100px] hidden md:block"></div>
            </div>
            <h2 className="text-3xl md:text-5xl text-gradient font-semibold tracking-wide mb-2">
              WELCOME
            </h2>
            <p className="text-gray-600 text-base md:text-lg text-center mb-5 -mt-2">
              Login with Email
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full max-w-md mx-auto items-center justify-center"
          >
            <input
              placeholder="Email Id"
              type="email"
              className={`bg-transparent border-2 ${
                errors.email ? "border-red-500" : "border-gray-600"
              } rounded-lg p-2 w-[60%] email-icon`}
              value={email}
              onChange={handleEmailChange}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
            <div className="relative w-[60%]">
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className={`bg-transparent border-2 ${
                  errors.password ? "border-red-500" : "border-gray-600"
                } rounded-lg p-2 w-full pr-10 password-icon`}
                value={password}
                onChange={handlePasswordChange}
              />
              <div
                className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-orange-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </div>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}

            <div className="relative w-full -mt-4">
              <div className="absolute right-[20%]">
                <span
                  className="text-gray text-[12px] cursor-pointer"
                  onClick={handleForgotPassword}
                >
                  Forgot your password?
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-full w-[44%] md:w-[40%] max-w-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            {errors.general && (
              <p className="text-center text-red-500 text-[14px] mt-[-10px] w-[60%]">
                {errors.general}
              </p>
            )}
            {successMessage && (
              <p className="text-green-500 mt-2">{successMessage}</p>
            )}

            <div className="flex items-center justify-center w-1/2 mt-4">
              <hr className="w-full border-t border-gray" />
              <span className="px-3 text-gray">OR</span>
              <hr className="w-full border-t border-gray" />
            </div>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              useOneTap
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
