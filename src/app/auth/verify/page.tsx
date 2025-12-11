
"use client";
import React, { useEffect, useState } from "react";
import AuthBackground from "../components/AuthBackground";
import AuthCard from "../components/AuthCard";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";


export const dynamic = 'force-dynamic';

interface OtpVerificationProps {
  contact?: string; // Email or phone number that OTP was sent to
}
export default function OtpVerificationPage({
  contact = "your email/phone",
}: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  useEffect(() => {
    const firstInput = document.getElementById("otp-0") as HTMLInputElement | null;
    firstInput?.focus();
  }, []);

  const router = useRouter();

  const searchParams = useSearchParams();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const otpValue = otp.join("");
      if (otpValue.length === 6) {
        // Here you would verify OTP with backend
        console.log("Verifying OTP:", otpValue);
        const payload: any = { otp: otp.join("") };
        // If query param had email or phone, send that field. Backend usually expects email or phone.
        const qEmail = searchParams.get("email");
        const qPhone = searchParams.get("phone");
        if (qEmail) payload.email = qEmail;
        if (qPhone) payload.phone = qPhone;
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log("OTP Verification API response:", data);
        if (!res.ok) {
          toast.error('OTP verification failed: ', data.message || "Unknown error");
          return;
        }
        // if (data.access) localStorage.setItem("access_token", data.access);
        // if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
        // if (data.data) localStorage.setItem("user", JSON.stringify(data.data));
        // redirect to dashboard
        toast.success("OTP verified successfully! Redirecting to home...");
        router.push("/home");
      }
    } catch (error) {
      alert("An error occurred during OTP verification. Please try again.");
    }
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    console.log("Resending OTP to:", contact);
    alert("OTP sent successfully!");
  };

  const handleBack = () => {
    // Navigate back to login page
    console.log("Navigating back to login");
    alert("Going back to login page...");
    router.push("/auth/login");
  };

  const otpValue = otp.join("");

  const isOtpComplete = otpValue.length === 6;
  
  return (
    <AuthBackground>
      <AuthCard>
        {/* <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-semibold">Back to Login</span>
        </button> */}
        <div className="form-title-area">
          <h1 className="form-title">
            <span className="title-large">YOUNG</span>
            <span className="title-small">PRO</span>
          </h1>
          <h4 className="form-subtitle mt-[100px] mb-6 verification-subtitle">Verify Code</h4>
        </div>
        <p className="text-normal text-center ">
          Please enter a six digit code sent on your phone number for
          verification
        </p>
          <div className="max-w-[588px] mt-[100px]">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-form-input"
                />
              ))}
            </div>
          </div>
        <div className="lg:space-y-[15px] space-y-2.5 form-area ">
          {/* OTP Input */}
          {/* Info Text */}
          {/* <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-700 text-sm">
              <strong>Tip:</strong> Check your spam folder if you don't see the code in your inbox.
            </p>
          </div> */}
          {/* Resend OTP */}
          <p className="text-center having-account-text pt-4">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="font-semibold hover:underline"
            >
              Resend OTP
            </button>
          </p>
          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={!isOtpComplete}
            className={`btn-gradient w-full  verified-btn ${
              isOtpComplete
                ? "btn-gradient opacity-100 cursor-pointer"
                : "btn-disabled opacity-50 cursor-not-allowed"
            }`}
          >
            Verify & Sign In
          </button>
        </div>
      </AuthCard>
    </AuthBackground>
  );
}
