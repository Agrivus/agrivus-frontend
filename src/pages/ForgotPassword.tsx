import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../components/common";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

type Step = "request" | "reset" | "done";

const DEFAULT_OTP_TTL_SECONDS = 90;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (step !== "reset" || remainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, remainingSeconds]);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setRequestLoading(true);

    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data?: {
          expiresInSeconds?: number;
        };
      }>("/auth/forgot-password", { email });

      const expiresInSeconds =
        response.data.data?.expiresInSeconds || DEFAULT_OTP_TTL_SECONDS;

      setRemainingSeconds(expiresInSeconds);
      setStep("reset");
      setMessage("OTP sent. Check your email and use it before it expires.");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (remainingSeconds <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setResetLoading(true);

    try {
      const response = await api.post<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword,
          confirmPassword,
        },
      );

      setStep("done");
      setMessage(
        response.data.message ||
          "Password reset successful. You can now log in with your new password.",
      );
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to reset password. Please try again."),
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8" hover={false}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-green font-serif mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600">
            {step === "request" &&
              "Enter your email to receive a one-time reset code."}
            {step === "reset" &&
              "Enter the OTP from your email and set your new password."}
            {step === "done" && "Your password has been reset successfully."}
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded shadow-sm mb-4">
            <p className="font-semibold">Success</p>
            <p className="text-sm mt-1">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-4">
            <p className="font-semibold">Action Failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {step === "request" && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={requestLoading}
              disabled={requestLoading}
            >
              {requestLoading ? "Sending OTP..." : "Send Reset OTP"}
            </Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="OTP Code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              helpText="Use the 6-digit code sent to your email"
              required
            />

            <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm text-amber-800">
              OTP expires in: <span className="font-semibold">{formattedTimer}</span>
            </div>

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={resetLoading}
              disabled={resetLoading || remainingSeconds <= 0}
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep("request");
                setError("");
                setMessage("");
              }}
            >
              Request New OTP
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="text-primary-green font-semibold hover:text-accent-gold transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
