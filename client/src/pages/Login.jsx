/**
 * Login.jsx — Email / password sign-in form
 *
 * On success the server sets an httpOnly cookie and we push
 * the user object into the Zustand auth store, then redirect
 * to the dashboard.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData);
      const { user } = response.data.data;
      setAuth(user);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left decorative panel (hidden on mobile) ─────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950
        items-center justify-center relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 max-w-md px-12 text-center">
          <div
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600
            flex items-center justify-center shadow-glow mb-8"
          >
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Clinic<span className="text-indigo-400">Hub</span>
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Streamline appointments, track patient care and access analytics —
            all from one unified platform.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              "Real-time updates",
              "Role-based access",
              "PDF reports",
              "Analytics",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 text-xs font-medium rounded-full
                  bg-white/5 text-slate-300 border border-white/10"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 animate-fade-in">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center">
            <div
              className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600
              flex items-center justify-center shadow-glow"
            >
              <Activity size={24} className="text-white" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form
            className="space-y-5 bg-white p-7 rounded-2xl shadow-card border border-slate-100"
            onSubmit={handleSubmit}
          >
            {error && (
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                bg-rose-50 border border-rose-200 text-rose-700 animate-slide-up"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-snug">{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 w-full h-11 px-4 bg-slate-50 border border-slate-200
                    rounded-xl text-sm text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                    transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 w-full h-11 px-4 bg-slate-50 border border-slate-200
                    rounded-xl text-sm text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                    transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-11 flex items-center justify-center gap-2
                text-sm font-semibold text-white rounded-xl
                bg-gradient-to-r from-indigo-600 to-indigo-500
                hover:from-indigo-700 hover:to-indigo-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
