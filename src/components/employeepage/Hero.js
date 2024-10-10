import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./hero.css";
import {
  addCount,
  addSessionCount,
  removeCount,
  removeSessionCount,
} from "../../store/forms";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { logout } from "../../store/auth";

const Employee = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [sessionCount, setSessionCount] = useState(() => {
    // Initialize sessionCount from localStorage, or default to 0 if not available
    const storedCount = localStorage.getItem("totalCount");
    return storedCount ? parseInt(storedCount, 10) : 0;
  });
  const [storedTime, setStoredTime] = useState(0); // Store the initial working hours
  const [elapsedTime, setElapsedTime] = useState(0);
  const count = useSelector((state) => state.form.count);
  const id = useSelector((state) => state.auth.userId);
  const email = useSelector((state) => state.auth.email);
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState({});

  const timeoutRef = useRef(null);
  const logoutTimeout = 30 * 60 * 1000; // 15 minutes
  const workLogs = users.workLogs;

  const getTodayWorkingHours = (workLogs) => {
    if (!workLogs || workLogs.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredLogs = workLogs?.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    if (filteredLogs.length > 1) {
      const TodayLogs = filteredLogs[filteredLogs.length - 2].workingHours;

      return TodayLogs;
    }
    return 0;
  };

  const formatWorkingHours = (totalHours) => {
    const hours = Math.floor(totalHours);
    const fracMinutes = totalHours - hours;
    const totalMinutes = fracMinutes * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes - minutes) * 60);
    if (hours === 0 && minutes === 0) return "00 : 00 : 00";
    return `${hours} : ${minutes} : ${seconds}`;
  };

  const [timeLeft, setTimeLeft] = useState(() => {
    // Restore timeLeft from localStorage, or default to 24 hours if not available
    const savedTime = localStorage.getItem("timeLeft");
    return savedTime ? parseInt(savedTime, 10) : 600 * 60 * 60;
  });

  const timerRef = useRef(null);

  // Memoized function to stop the timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Memoized function to handle logout
  const handleEmployeeLogout = useCallback(async () => {
    try {
      stopTimer();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/logout`,
        { userId: id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("count");
      dispatch(logout());
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [stopTimer, dispatch, navigate, id, token]);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      handleEmployeeLogout();
    }, logoutTimeout);
  };

  // Memoized function to start the timer
  const startTimer = useCallback(() => {
    if (timerRef.current) return; // Prevent multiple timers

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          // Safely reset session count only after stopping the timer
          setSessionCount(0);
          dispatch(removeCount());
          dispatch(removeSessionCount());
          handleEmployeeLogout();
          localStorage.removeItem("timeLeft");
          localStorage.removeItem("count");
          localStorage.removeItem("totalCount");

          return 0;
        }

        const newTime = prevTime - 1;
        localStorage.setItem("timeLeft", newTime); // Save the new timeLeft to localStorage
        return newTime;
      });
    }, 1000);
  }, [handleEmployeeLogout, dispatch]);

  useEffect(() => {
    startTimer();

    return () => {
      stopTimer(); // Clean up on unmount
    };
  }, [startTimer, stopTimer]);

  useEffect(() => {
    resetTimer();
    // Sync sessionCount with localStorage only when necessary
    localStorage.setItem("totalCount", sessionCount);
    dispatch(addSessionCount(sessionCount));
  }, [sessionCount, dispatch]);

  // Function to format time left
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startLogoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear any previous timers
    }

    // Set a new timeout for automatic logout

    timeoutRef.current = setTimeout(() => {
      handleEmployeeLogout(); // Trigger logout when the timer finishes
    }, logoutTimeout);
  }, [handleEmployeeLogout, logoutTimeout]);

  const [formData, setFormData] = useState({
    employeeId: id,
    name: "",
    contactNumber: "",
    email: "",
    languages: [],
    profile: "",
    motherName: "",
    fatherName: "",
    dateOfBirth: "",
    maritalStatus: "",
    permanentAddress: "",
    qualification: "",
    qualificationDetails: {
      10: "",
      12: "",
      Graduation: "",
    }, // Added qualification details state
    extraQualifications: "",
    extraQualificationsDetails: {
      Certification: "",
      Diploma: "",
    },
    experience: ["", "", ""],
    roleResponsibilities: "",
    softSkills: [],
    technicalSkills: [],
    linkedIn: "",
    serialNumber: "",
  });

  useEffect(() => {
    localStorage.setItem("totalCount", sessionCount);
    dispatch(addSessionCount(sessionCount));

    const fetchUser = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/search`,
          { id, email },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (err) {
        setErrorMessage(err.message);
      }
    };
    fetchUser();
  }, [sessionCount, dispatch, email, id, token]);

  useEffect(() => {
    const dateInput = document.getElementById("dateOfBirth");

    dateInput.addEventListener("focus", handleFocus);
    dateInput.addEventListener("blur", handleBlur);

    return () => {
      dateInput.removeEventListener("focus", handleFocus);
      dateInput.removeEventListener("blur", handleBlur);
    };
  }, []);

  const handleFocus = (e) => {
    const target = e.target;
    if (target.type === "text") {
      target.type = "date";
    }
  };

  const handleBlur = (e) => {
    const target = e.target;
    if (target.value === "") {
      target.type = "text";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      const isNumeric = /^[0-9]*$/.test(value); // Check if the value is numeric
      if (isNumeric && value.length <= 10) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errorMessage[name]) {
      setErrorMessage((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQualificationChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      qualificationDetails: {
        ...prevData.qualificationDetails,
        [key]: value,
      },
    }));
    setErrorMessage((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (value.trim()) {
        newErrors[`qualificationDetails.${key}`] = "";
      }
      return newErrors;
    });
  };
  const handleExtraQualificationChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      extraQualificationsDetails: {
        ...prevData.extraQualificationsDetails,
        [key]: value,
      },
    }));
    setErrorMessage((prevErrors) => ({
      ...prevErrors,
      [`extraQualificationsDetails.${key}`]: "",
    }));
  };
  const handleExperienceChange = (e, index) => {
    const { value } = e.target;
    setFormData((prevData) => {
      const newExperience = [...prevData.experience];
      newExperience[index] = value;
      return {
        ...prevData,
        experience: newExperience,
      };
    });
    if (formData.experience[0].trim !== "") {
      setErrorMessage((prevError) => ({
        ...prevError,
        experience: "",
      }));
    }
  };

  const handleOptionClick = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage((prevErrors) => {
      if (name === "extraQualifications") {
        return {
          ...prevErrors,
          extraQualifications: "",
          "extraQualificationsDetails.Certification": "",
          "extraQualificationsDetails.Diploma": "",
        };
      }
      if (name === "qualification") {
        return {
          ...prevErrors,
          qualification: "",
        };
      }

      return prevErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors = {};

    // Check if all fields are filled
    if (!formData.employeeId) errors.employeeId = "Employee ID is required";
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.contactNumber)
      errors.contactNumber = "Contact Number is required";
    else if (formData.contactNumber.length !== 10)
      errors.contactNumber = "Contact Number should be 10 digits long";
    if (!formData.qualification)
      errors.qualification = "Qualification is required";
    if (!formData.roleResponsibilities)
      errors.roleResponsibilities = "Role and Responsibilities is required";
    if (!formData.fatherName) errors.fatherName = "Father Name is required";
    if (!formData.motherName) errors.motherName = "Mother Name is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";
    if (!formData.maritalStatus)
      errors.maritalStatus = "Marital Status is required";
    if (!formData.permanentAddress)
      errors.permanentAddress = "Permanent Address is required";
    if (formData.languages.length === 0)
      errors.languages = "Languages are required";
    if (formData.softSkills.length === 0)
      errors.softSkills = "Soft Skills are required";
    if (formData.technicalSkills.length === 0)
      errors.technicalSkills = "Technical Skills are required";
    if (!formData.linkedIn) errors.linkedIn = "LinkedIn is required";
    if (!formData.profile) errors.profile = "Profile/Summary is required";
    if (!formData.serialNumber)
      errors.serialNumber = "Serial Number is required";
    // Check if qualification details are present and validate each property
    if (!formData.qualification) {
      errors.qualification = "Qualification is required";
    } else {
      if (!formData.qualificationDetails["10"]) {
        errors["qualificationDetails.10"] = "10th details are required";
      }
      if (!formData.qualificationDetails["12"]) {
        errors["qualificationDetails.12"] = "12th details are required";
      }
      if (!formData.qualificationDetails["Graduation"]) {
        errors["qualificationDetails.Graduation"] =
          "Graduation details are required";
      }
    }

    if (!formData.extraQualifications) {
      errors.extraQualifications = "Extra Qualification is required";
    } else {
      switch (formData.extraQualifications) {
        case "Certification":
          if (!formData.extraQualificationsDetails.Certification) {
            errors["extraQualificationsDetails.Certification"] =
              "Certification details are required";
          }
          break;
        case "Diploma":
          if (!formData.extraQualificationsDetails.Diploma) {
            errors["extraQualificationsDetails.Diploma"] =
              "Diploma details are required";
          }
          break;
        case "Both":
          if (!formData.extraQualificationsDetails.Certification) {
            errors["extraQualificationsDetails.Certification"] =
              "Certification details are required";
          }
          if (!formData.extraQualificationsDetails.Diploma) {
            errors["extraQualificationsDetails.Diploma"] =
              "Diploma details are required";
          }
          break;
        default:
          errors.extraQualifications = "Invalid Extra Qualification selection";
      }
    }

    const isEmpty = formData.experience.every((exp) => exp.trim() === "");
    if (isEmpty)
      errors.experience = "At least one experience field must be filled in.";
    setErrorMessage(errors);

    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false);
      errors.general = "Please fill in all required details";
      setErrorMessage(errors);
      return;
    }

    const allFieldsFilled = Object.entries(formData).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== "";
    });

    if (!allFieldsFilled) {
      console.error("Error: All fields are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/form/create`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      resetTimer();
      localStorage.setItem("count", response.data.count);
      dispatch(addCount(response.data.count));
      setSessionCount((prevCount) => prevCount + 1);

      alert("Form submitted successfully!");
      setFormData({
        employeeId: id,
        name: "",
        contactNumber: "",
        profile: "",
        email: "",
        languages: [],
        motherName: "",
        fatherName: "",
        dateOfBirth: "",
        maritalStatus: "",
        permanentAddress: "",
        qualification: "",
        qualificationDetails: {
          10: "",
          12: "",
          Graduation: "",
        },
        extraQualifications: "",
        extraQualificationsDetails: {
          Certification: "",
          Diploma: "",
        },
        experience: ["", "", ""],
        roleResponsibilities: "",
        softSkills: [],
        technicalSkills: [],
        linkedIn: "",
        serialNumber: "",
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableCopyPaste = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    // Start the timer when the component mounts
    startLogoutTimer();

    // Cleanup function to clear the timer when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startLogoutTimer]);

  useEffect(() => {
    // Store the initial working hours when component mounts
    const initialTime = getTodayWorkingHours(workLogs);
    setStoredTime(initialTime);

    const interval = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [workLogs]);

  const totalTime = storedTime + elapsedTime / 3600;

  return (
    <>
      <div className="w-full flex justify-center py-10">
        <div className="w-[90%] flex flex-col items-center">
          <div className="flex justify-between mb-5 w-full">
            <div className=" font-semibold text-[#666666]">
              <p>
                Working Hours:{" "}
                <span className="text-[#FB861E]">
                  {formatWorkingHours(totalTime)}
                </span>
              </p>
            </div>
            <div>
              <button
                onClick={handleEmployeeLogout}
                className={`flex flex-col items-center text-[20px] max-xl:text-[18px] max-lg:text-[16px] font-semibold text-[#666666]`}
              >
                <IoLogOutOutline className="text-[24px] max-xl:text-[20px] max-lg:text-[18px]" />
                Log Out
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-[#666666] text-[48px] text-center font-semibold">
              Form <span className="text-[#FB861E]">Submission Metrics</span>
            </h2>
            <div className="flex justify-center gap-10 py-5 text-[20px] text-[#666666]">
              <div className="flex flex-col items-center">
                <p className="opacity-[0.6]">Forms Submitted in Session</p>
                <p>{`${users.totalForms}` || "--"}/2500</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="opacity-[0.6]">Forms Submitted Today</p>
                <p>{count || 0}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="opacity-[0.6]">Countdown Timer</p>
                <p>{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          <div className="border-b border-[#016DE2] w-full pb-10"></div>
          <div className="w-[80%]">
            <h2 className="text-[#666666] text-[40px] text-center font-semibold mb-4">
              Resume <span className="text-[#FB861E]">Details Form</span>
            </h2>
            <p className="text-secondary font-medium text-[20px] text-center">
              Please fill in the required details
            </p>
            <form
              onSubmit={(e) => handleSubmit(e)}
              className="grid grid-cols-2 gap-10"
            >
              <div className="flex flex-col">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter First_Name Last_Name"
                  value={formData.name}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                  autoComplete="off"
                />
                {errorMessage.name && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.name}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  maxLength="10"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.contactNumber && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.contactNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="profile"
                  placeholder="Enter Profile/ Summary"
                  value={formData.profile}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent col-span-2 border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.profile && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.profile}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Adress"
                  value={formData.email}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.email && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.email}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="languages"
                  placeholder="Enter Languages Known (comma-separated)"
                  value={formData.languages.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value
                      .split(",")
                      .map((language) => language.trim());
                    setFormData({ ...formData, languages: value });

                    setErrorMessage((prevErrors) => ({
                      ...prevErrors,
                      languages:
                        value.length > 0 && value[0] !== ""
                          ? ""
                          : prevErrors.languages,
                    }));
                  }}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.languages && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.languages}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="motherName"
                  placeholder="Enter mother's name"
                  value={formData.motherName}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.motherName && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.motherName}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Enter father's name"
                  value={formData.fatherName}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.fatherName && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.fatherName}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  placeholder="Enter your date of birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.dateOfBirth && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.dateOfBirth}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="maritalStatus"
                  placeholder="Enter your marital status"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.maritalStatus && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.maritalStatus}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="permanentAddress"
                  placeholder="Enter your permanent address"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent col-span-2 border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.permanentAddress && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.permanentAddress}
                  </span>
                )}
              </div>

              {/* Qualification Options */}
              <div className="flex gap-5 items-center flex-row grid-item col-span-2">
                <label>Qualification:</label>
                <div
                  className={`option ${
                    formData.qualification === "10th" ? "active" : ""
                  }`}
                  onClick={() => handleOptionClick("qualification", "10th")}
                >
                  10th
                </div>
                <div
                  className={`option ${
                    formData.qualification === "12th" ? "active" : ""
                  }`}
                  onClick={() => handleOptionClick("qualification", "12th")}
                >
                  12th
                </div>
                <div
                  className={`option ${
                    formData.qualification === "Graduation" ? "active" : ""
                  }`}
                  onClick={() =>
                    handleOptionClick("qualification", "Graduation")
                  }
                >
                  Graduation
                </div>
                {errorMessage.qualification && (
                  <span className="text-red-500 text-sm block">
                    {errorMessage.qualification}
                  </span>
                )}
              </div>

              {/* Dynamic input fields */}
              {formData.qualification && (
                <>
                  <input
                    type="text"
                    name="qualificationDetails.10"
                    placeholder="Enter details for 10th"
                    value={formData.qualificationDetails["10"]}
                    onChange={(e) =>
                      handleQualificationChange("10", e.target.value)
                    }
                    autoComplete="off"
                    onCopy={disableCopyPaste}
                    onPaste={disableCopyPaste}
                    onCut={disableCopyPaste}
                    spellCheck={false}
                    className="bg-transparent border border-[#666666] rounded-lg p-4 col-span-2"
                  />
                  {errorMessage["qualificationDetails.10"] && (
                    <span className="text-red-500 text-sm block -mt-8 grid-item col-span-2">
                      {errorMessage["qualificationDetails.10"]}
                    </span>
                  )}
                  {(formData.qualification === "12th" ||
                    formData.qualification === "Graduation") && (
                    <input
                      type="text"
                      name="qualificationDetails.12"
                      placeholder="Enter details for 12th"
                      value={formData.qualificationDetails["12"]}
                      autoComplete="off"
                      onCopy={disableCopyPaste}
                      onPaste={disableCopyPaste}
                      onCut={disableCopyPaste}
                      spellCheck={false}
                      onChange={(e) =>
                        handleQualificationChange("12", e.target.value)
                      }
                      className="bg-transparent border border-[#666666] rounded-lg p-4 col-span-2"
                    />
                  )}
                  {errorMessage["qualificationDetails.12"] && (
                    <span className="text-red-500 text-sm block -mt-8 grid-item col-span-2">
                      {errorMessage["qualificationDetails.12"]}
                    </span>
                  )}
                  {formData.qualification === "Graduation" && (
                    <input
                      type="text"
                      name="qualificationDetails.Graduation"
                      placeholder="Enter details for Graduation"
                      value={formData.qualificationDetails["Graduation"]}
                      autoComplete="off"
                      onCopy={disableCopyPaste}
                      onPaste={disableCopyPaste}
                      onCut={disableCopyPaste}
                      spellCheck={false}
                      onChange={(e) =>
                        handleQualificationChange("Graduation", e.target.value)
                      }
                      className="bg-transparent border border-[#666666] rounded-lg p-4 col-span-2"
                    />
                  )}
                  {errorMessage["qualificationDetails.Graduation"] && (
                    <span className="text-red-500 text-sm block -mt-8 grid-item col-span-2">
                      {errorMessage["qualificationDetails.Graduation"]}
                    </span>
                  )}
                </>
              )}
              {/* // JSX for Extra-Qualification Options */}
              <div className="flex gap-5 items-center grid-item col-span-2">
                <label>Extra Qualification:</label>
                <div
                  className={`option ${
                    formData.extraQualifications === "Certification"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleOptionClick("extraQualifications", "Certification")
                  }
                >
                  Certification
                </div>
                <div
                  className={`option ${
                    formData.extraQualifications === "Diploma" ? "active" : ""
                  }`}
                  onClick={() =>
                    handleOptionClick("extraQualifications", "Diploma")
                  }
                >
                  Diploma
                </div>
                <div
                  className={`option ${
                    formData.extraQualifications === "Both" ? "active" : ""
                  }`}
                  onClick={() =>
                    handleOptionClick("extraQualifications", "Both")
                  }
                >
                  Both
                </div>
                {errorMessage.extraQualifications && (
                  <span className="text-red-500 text-sm block">
                    {errorMessage.extraQualifications}
                  </span>
                )}
              </div>

              {/* // JSX for Dynamic Input Fields */}
              <>
                {["Certification", "Both"].includes(
                  formData.extraQualifications
                ) && (
                  <input
                    type="text"
                    name="extraQualificationsDetails.Certification"
                    placeholder="Enter details for Certification"
                    value={
                      formData.extraQualificationsDetails["Certification"] || ""
                    }
                    autoComplete="off"
                    onCopy={disableCopyPaste}
                    onPaste={disableCopyPaste}
                    onCut={disableCopyPaste}
                    spellCheck={false}
                    onChange={(e) =>
                      handleExtraQualificationChange(
                        "Certification",
                        e.target.value
                      )
                    }
                    className="bg-transparent border border-[#666666] rounded-lg p-4 col-span-2"
                  />
                )}
                {errorMessage["extraQualificationsDetails.Certification"] && (
                  <span className="text-red-500 text-sm block -mt-8 grid-item col-span-2">
                    {errorMessage["extraQualificationsDetails.Certification"]}
                  </span>
                )}

                {["Diploma", "Both"].includes(formData.extraQualifications) && (
                  <input
                    type="text"
                    name="extraQualificationsDetails.Diploma"
                    placeholder="Enter details for Diploma"
                    value={formData.extraQualificationsDetails["Diploma"] || ""}
                    autoComplete="off"
                    onCopy={disableCopyPaste}
                    onPaste={disableCopyPaste}
                    onCut={disableCopyPaste}
                    spellCheck={false}
                    onChange={(e) =>
                      handleExtraQualificationChange("Diploma", e.target.value)
                    }
                    className="bg-transparent border border-[#666666] rounded-lg p-4 col-span-2"
                  />
                )}
                {errorMessage["extraQualificationsDetails.Diploma"] && (
                  <span className="text-red-500 text-sm block -mt-8 grid-item col-span-2">
                    {errorMessage["extraQualificationsDetails.Diploma"]}
                  </span>
                )}
              </>
              <div className="col-span-2 flex flex-col gap-5">
                <label>Experience:</label>
                {errorMessage.experience && (
                  <span className="text-red-500 text-sm -mt-3 flex flex-col">
                    {errorMessage.experience}
                  </span>
                )}
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="text"
                    name={`experience${index}`}
                    placeholder={`Enter your experience ${index + 1}`}
                    value={formData.experience[index] || ""}
                    onChange={(e) => handleExperienceChange(e, index)}
                    onCopy={disableCopyPaste}
                    autoComplete="off"
                    onPaste={disableCopyPaste}
                    onCut={disableCopyPaste}
                    spellCheck={false}
                    className="bg-transparent border border-[#666666] rounded-lg p-4 col-span-2"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <input
                  type="text"
                  name="roleResponsibilities"
                  placeholder="Enter your role & responsibilities"
                  value={formData.roleResponsibilities}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  autoComplete="off"
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  className="bg-transparent col-span-2 border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.roleResponsibilities && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.roleResponsibilities}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="softSkills"
                  placeholder="Enter your softSkills (comma-separated)"
                  value={formData.softSkills.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value
                      .split(",")
                      .map((skill) => skill.trim());
                    setFormData({ ...formData, softSkills: value });

                    setErrorMessage((prevErrors) => ({
                      ...prevErrors,
                      softSkills:
                        value.length > 0 && value[0] !== ""
                          ? ""
                          : prevErrors.softSkills,
                    }));
                  }}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.softSkills && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.softSkills}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="technicalSkills"
                  placeholder="Enter your technicalSkills (comma-separated)"
                  value={formData.technicalSkills.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value
                      .split(",")
                      .map((techskill) => techskill.trim());
                    setFormData({ ...formData, technicalSkills: value });

                    setErrorMessage((prevErrors) => ({
                      ...prevErrors,
                      technicalSkills:
                        value.length > 0 && value[0] !== ""
                          ? ""
                          : prevErrors.technicalSkills,
                    }));
                  }}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.technicalSkills && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.technicalSkills}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="linkedIn"
                  placeholder="Enter your linkedIn URL"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.linkedIn && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.linkedIn}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="serialNumber"
                  placeholder="Enter Serial Number (e.g abcd1234)"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-transparent border border-[#666666] rounded-lg p-4"
                />
                {errorMessage.serialNumber && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errorMessage.serialNumber}
                  </span>
                )}
              </div>

              <div className="col-span-2 flex justify-center w-full relative">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className=" bg-gradient-to-r from-[#007BFF] to-[#0056B3] text-[#fff] py-3 px-6 rounded-[30px]"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                {errorMessage.general && (
                  <span className="text-red-500 text-sm absolute top-full mt-2 text-center">
                    {errorMessage.general}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Employee;
