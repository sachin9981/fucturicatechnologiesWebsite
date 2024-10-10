import React, { useState } from "react";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const RegisterEmployee = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const formData = {
      name,
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Employee created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Clear the error message if any
      setError("");
    } catch (error) {
      console.error("Error creating employee:", error);
      setError("There was an error creating the employee.");
    } finally {
      setIsSubmitting(false); // Stop loader
    }
  };

  const handleBackClick = () => {
    navigate("/admin-panel");
  };

  return (
    <>
      <div className="flex items-center m-5 ">
        <button
          onClick={handleBackClick}
          className="text-[#666666] flex items-center gap-2"
        >
          <IoIosArrowRoundBack className="text-2xl" />
          Back
        </button>
      </div>
      <div className="w-full flex h-[650px] justify-center">
        <div className="w-[90%] flex">
          <div className="w-[50%] flex flex-col justify-center items-center">
            <h2 className="text-[#666666] text-[48px] font-semibold">
              Create <span className="text-[#FB861E]">New Employee</span>
            </h2>
            <p className="text-[#666666] font-light text-[20px] text-center">
              Fill in the details below to create a new employee
            </p>
          </div>
          <div className="w-[50%] flex justify-center items-center rounded-xl shadow-lg bg-[#fff] my-10">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col w-[60%] gap-5 py-10"
            >
              <input
                placeholder="Username"
                type="text"
                className="bg-transparent border-2 border-[#666666] rounded-lg p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="Email Id"
                type="email"
                className="bg-transparent border-2 border-[#666666] rounded-lg p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                placeholder="Password"
                type="password"
                className="bg-transparent border-2 border-[#666666] rounded-lg p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                placeholder="Confirm Password"
                type="password"
                className="bg-transparent border-2 border-[#666666] rounded-lg p-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}
              <button
                type="submit"
                className="mt-4 bg-gradient-to-r from-[#007BFF] to-[#0056B3] text-white p-2 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterEmployee;
