import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import type { Route } from "./+types/login";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Login - Opennie" },
    { name: "description", content: "Log in to your Opennie account" },
  ];
}

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear related error
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // Stable input handler functions
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, email: e.target.value }));
      setErrors((prev) => ({ ...prev, email: undefined }));
    },
    [],
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, password: e.target.value }));
      setErrors((prev) => ({ ...prev, password: undefined }));
    },
    [],
  );

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Login failed, please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto w-24 h-24">
            <img
              src="/icon/128.png"
              alt="Opennie Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Opennie 🪙
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up now
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-expense-50 p-4">
              <div className="text-sm text-expense-700">{errors.general}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input-base ${errors.email ? "input-error" : ""}`}
                placeholder="Email Address"
                value={formData.email}
                onChange={handleEmailChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-expense-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`input-base ${errors.password ? "input-error" : ""}`}
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-expense-600">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2 px-4 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
