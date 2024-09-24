import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AdminVerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Get the email from the state passed from the login page

  const { email } = location.state || {};
  // Check if the email is present
  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-center mb-6">Error</h2>
          <p className="text-red-500 text-center">
            Email is missing. Please go back and try again.
          </p>
          <button
            className="w-full py-3 mt-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => navigate("/login")}
          >
            Go Back to Login
          </button>
        </div>
      </div>
    );
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("email", email);
      console.log("otp", otp);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/verify-otp`,
        { otp, email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage("OTP verified. Redirecting to Admin Page...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.msg || "An error occurred");
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Enter OTP</h2>
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <input
            type="number"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white ${
              isSubmitting ? "bg-blue-500" : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          {successMessage && (
            <p className="text-green-500 mt-2">{successMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminVerifyOtp;
