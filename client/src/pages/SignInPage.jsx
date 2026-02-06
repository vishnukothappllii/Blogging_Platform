import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (loginMethod === "email" && !formData.email) {
      setError("Please enter your email.");
      return;
    } else if (loginMethod === "username" && !formData.username) {
      setError("Please enter your username.");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    const loginData = { password: formData.password };
    if (loginMethod === "email") loginData.email = formData.email;
    else loginData.username = formData.username;

    const result = await login(loginData);
    if (result.success) {
      if (result.requiresOtp) {
        setSuccess("OTP sent to your email.");
        navigate("/verify-otp");
      } else {
        setSuccess("Login successful.");
        // Navigate to dashboard or home
        navigate("/dashboard");
      }
    } else {
      setError(result.message);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4 dark:from-gray-900 dark:to-blue-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/60 p-8 shadow-2xl backdrop-blur-lg dark:bg-gray-800/60 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sign In</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter your credentials to access your account
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && <p className="text-center text-sm font-medium text-red-500">{error}</p>}
          {success && <p className="text-center text-sm font-medium text-green-500">{success}</p>}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                loginMethod === "email"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("username")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                loginMethod === "username"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Username
            </button>
          </div>
          {loginMethod === "email" ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
                placeholder="yourusername"
              />
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <button
              onClick={handleSignupRedirect}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}