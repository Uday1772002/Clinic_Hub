/**
 * Register.jsx — New-user registration form
 *
 * Collects name, email, password, phone and role.  If the user
 * selects "doctor", extra fields for specialization and license
 * number appear.  Matches the Login page design language.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  AlertCircle,
  Activity,
  Stethoscope,
  BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

const inputCls =
  "pl-11 w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
    specialization: "",
    licenseNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Please provide your first and last name");
      return false;
    }
    if (
      !formData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setError("Please provide a valid email address");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.role === "doctor") {
      if (!formData.specialization || !formData.licenseNumber) {
        setError("Doctors must provide specialization and license number");
        return false;
      }
    }
    return true;
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
      return;
    }
    if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const dataToSend = { ...formData };
      if (formData.role === "patient") {
        delete dataToSend.specialization;
        delete dataToSend.licenseNumber;
      }

      await authAPI.register(dataToSend);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") checkPasswordStrength(value);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left decorative panel (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-[420px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950
        items-center justify-center relative overflow-hidden shrink-0"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 max-w-xs px-10 text-center">
          <div
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600
            flex items-center justify-center shadow-glow mb-8"
          >
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Clinic<span className="text-indigo-400">Hub</span>
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed text-sm">
            Join thousands of healthcare professionals managing their practice
            more efficiently.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              "Manage appointments in real-time",
              "Secure patient health records",
              "Generate PDF visit reports",
              "Track clinic analytics",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 animate-fade-in">
        <div className="w-full max-w-lg space-y-6">
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
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Get started with ClinicHub in seconds
            </p>
          </div>

          <form
            className="space-y-4 bg-white p-7 rounded-2xl shadow-card border border-slate-100"
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

            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

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
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone + Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
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
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>
                {passwordStrength && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength === "weak"
                            ? "w-1/3 bg-rose-500"
                            : passwordStrength === "medium"
                              ? "w-2/3 bg-amber-500"
                              : "w-full bg-emerald-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        passwordStrength === "weak"
                          ? "text-rose-600"
                          : passwordStrength === "medium"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {passwordStrength.charAt(0).toUpperCase() +
                        passwordStrength.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "patient", label: "Patient", icon: User },
                  { value: "doctor", label: "Doctor", icon: Stethoscope },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      handleChange({ target: { name: "role", value } })
                    }
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      formData.role === value
                        ? "border-indigo-500 bg-indigo-50/60 text-indigo-700 ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor-specific fields */}
            {formData.role === "doctor" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-slide-up">
                <div>
                  <label
                    htmlFor="specialization"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Specialization
                  </label>
                  <div className="relative">
                    <Stethoscope
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      required
                      value={formData.specialization}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Cardiology"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    License Number
                  </label>
                  <div className="relative">
                    <BadgeCheck
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="LIC123456"
                    />
                  </div>
                </div>
              </div>
            )}

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
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
