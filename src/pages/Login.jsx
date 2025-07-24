import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeImage from "../images/education.svg";
import UserService from "../service/UserService";
import { toast } from "react-toastify";

const LoginForm = () => {
  const [username, setUsername] = useState(""); // Changed from userName to username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear error after 5 seconds when error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check if user is already logged in and redirect appropriately
  useEffect(() => {
    if (UserService.isAuthenticated()) {
      const userRole = UserService.getRole();
      redirectBasedOnRole(userRole);
    }
  }, [navigate]);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "ADMIN":
        navigate("/admin", { replace: true });
        break;
      case "STUDENT":
        navigate("/student", { replace: true });
        break;
      case "TEACHER":
        navigate("/teacher", { replace: true });
        break;
      default:
        toast.error("Invalid role assigned to user");
        UserService.logout();
        break;
    }
  };

  const validateForm = () => {
    // Clear previous error
    setError("");

    // Validate username
    if (!username || !username.trim()) {
      setError("username is required");
      return false;
    }

    // Optional: Add username format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username.trim())) {
      setError("Please enter a valid username");
      return false;
    }

    // Username format validation based on backend pattern (alphanumeric and underscores, 3-20 chars)
    // const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    // if (!usernamePattern.test(username.trim())) {
    //   setError("Username must be 3-20 characters long and contain only letters, numbers, and underscores");
    //   return false;
    // }

    // Validate password
    if (!password || !password.trim()) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userData = await UserService.login(
        username.trim().toLowerCase(),
        password
      );
      console.log("Login response:", userData);

      if (userData.statusCode === 200 && userData.token) {
        UserService.saveUserData(userData); // Save user data including refresh token

        // Show success message with user's name if available
        const welcomeMessage = userData.name
          ? `Welcome back, ${userData.name}! Logged in as ${userData.role}`
          : `Welcome back! Logged in as ${userData.role}`;

        toast.success(welcomeMessage);

        redirectBasedOnRole(userData.role); // Navigate based on role
      } else {
        // Handle different error status codes from backend
        let errorMessage;

        switch (userData.statusCode) {
          case 400:
            errorMessage =
              userData.message ||
              "Invalid input. Please check your credentials.";
            break;
          case 401:
            errorMessage = userData.message || "Invalid username or password.";
            break;
          case 403:
            errorMessage =
              userData.message ||
              "Account is disabled. Please contact administrator.";
            break;
          case 423:
            errorMessage =
              userData.message ||
              "Account is locked. Please contact administrator.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage =
              userData.message || "Login failed. Please try again.";
        }

        setError(errorMessage);
        console.error("Login failed:", errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle network errors or other exceptions
      let errorMessage;
      if (error.name === "NetworkError" || error.message.includes("fetch")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        errorMessage =
          error.message || "Login failed. Please check your credentials.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Forgot password functionality not implemented yet");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center h-screen w-full px-5 sm:px-0">
      <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden max-w-sm lg:max-w-4xl w-full">
        <div
          className="hidden md:block lg:w-1/2 bg-cover"
          style={{
            backgroundImage: `url(${HomeImage})`,
            backgroundSize: "450px 350px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <div className="w-full p-8 lg:w-1/2">
          <form onSubmit={handleSubmit}>
            <p className="text-xl text-gray-600 text-center">
              Welcome to Sisulka OES
            </p>
            <div className="mt-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                // type="email"
                className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div className="mt-4 flex flex-col justify-between">
              <div className="flex justify-between">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <input
                className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-gray-500 hover:text-gray-900 text-end w-full mt-2"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                className={`w-full font-bold py-2 px-4 rounded transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-700 hover:bg-blue-600 text-white"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <div className="mt-4 flex items-center w-full text-center">
              <button
                type="button"
                onClick={handleSignUp}
                className="text-xs text-gray-500 capitalize text-center w-full hover:text-gray-700"
              >
                Don&apos;t have any account yet?{" "}
                <span className="text-blue-700 font-semibold">Sign Up</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
