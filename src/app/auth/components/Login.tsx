"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SignInGoogle from "../components/sign-in-google";
import SignInLinkedin from "../components/sign-in-linkedin";
import AuthBackground from "../components/AuthBackground";
import AuthCard from "../components/AuthCard";
import ToggleBtn from "../components/ToggelBtn";
import { toast } from "react-toastify";
import PhoneInputAuto from "../components/PhoneInputAuto";


interface LoginData {
  email: string;
  phone: string;
}

interface LoginErrors {
  email?: string;
  phone?: string;
  contact?: string;
}

interface LoginPageProps {
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoginPage({ isLogin, setIsLogin }: LoginPageProps) {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<LoginErrors>({});

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Either email or phone must be provided
    if (!loginData.email.trim() && !loginData.phone.trim()) {
      newErrors.contact = "Please provide either an email or phone number";
    }

    // If email is provided, validate format
    if (
      loginData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // If phone is provided, validate format
    if (loginData.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(loginData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (validateForm()) {
      console.log("Sending OTP to:", loginData.email || loginData.phone);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });

        const data = await res.json();
        console.log("Login API response:", data);

        if (!res.ok) {
          toast.error(
            data.message || "Failed to send OTP. Please try again.",
          );
          setLoginData({ email: "", phone: "" });
          return;
        }

        const contactInfo = loginData.email || loginData.phone;
        console.log("OTP sent to: ", contactInfo);

        toast.success("OTP sent successfully! Redirecting to verification page...");

        router.push(
          `/auth/verify${
            loginData.email
              ? `?email=${encodeURIComponent(loginData.email)}`
              : ""
          }${
            loginData.phone
              ? `${loginData.email ? "&" : "?"}phone=${encodeURIComponent(
                  loginData.phone
                )}`
              : ""
          }`
        );
      } catch (error) {
        toast.error(
          "An unexpected error occurred. Please try again later."
        );
        console.error("Error during login API call:", error);
      }
    }
  };

  return (
    <AuthBackground>
      <AuthCard>
        <div className="form-title-area">
          <h1 className="form-title">
            <span className="title-large">YOUNG</span>
            <span className="title-small">PRO</span>
          </h1>
          <h4 className="form-subtitle mt-[34px] mb-6">Welcome Back</h4>
        </div>

        <ToggleBtn isLogin={isLogin} setIsLogin={setIsLogin} />

        <div className="lg:space-y-[15px] space-y-2.5 form-area">
          <div className="form-input-custom">
            <div className="relative">
              <div className="icon-input">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M3.84667 15.8333C3.46278 15.8333 3.1425 15.705 2.88583 15.4483C2.62917 15.1916 2.50056 14.8711 2.5 14.4866V5.51329C2.5 5.1294 2.62861 4.80913 2.88583 4.55246C3.14306 4.29579 3.46306 4.16718 3.84583 4.16663H16.1542C16.5375 4.16663 16.8575 4.29524 17.1142 4.55246C17.3708 4.80968 17.4994 5.12996 17.5 5.51329V14.4875C17.5 14.8708 17.3714 15.1911 17.1142 15.4483C16.8569 15.7055 16.5369 15.8338 16.1542 15.8333H3.84667ZM16.6667 5.73746L10.3733 9.85746C10.3144 9.88802 10.255 9.91385 10.195 9.93496C10.1344 9.95551 10.0694 9.96579 10 9.96579C9.93056 9.96579 9.86556 9.95551 9.805 9.93496C9.74444 9.9144 9.685 9.88857 9.62667 9.85746L3.33333 5.73663V14.4866C3.33333 14.6366 3.38139 14.7597 3.4775 14.8558C3.57361 14.9519 3.69667 15 3.84667 15H16.1542C16.3036 15 16.4264 14.9519 16.5225 14.8558C16.6186 14.7597 16.6667 14.6366 16.6667 14.4866V5.73746ZM10 9.16663L16.41 4.99996H3.59L10 9.16663ZM3.33333 5.91329V5.23746V5.26579V4.99996V5.26663V5.22329V5.91329Z"
                    fill="#A0AEC0"
                  />
                </svg>
              </div>

              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                disabled={loginData.phone.length > 0} // <-- add this
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl 
                  ${loginData.phone ? "cursor-not-allowed opacity-50" : ""} 
                  ${errors.email ? "border-red-500" : "border-gray-200"}
                `}
                placeholder="Email Id"
              />
            </div>
          </div>

          <p className="text-center text-normal lg:my-6 my-2.5 ">Or</p>

          <div className="form-input-custom">
            <div className="relative">
              <div className="icon-input">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9.99999 15.7808C10.4602 15.7808 10.8333 15.4077 10.8333 14.9475C10.8333 14.4872 10.4602 14.1141 9.99999 14.1141C9.53975 14.1141 9.16666 14.4872 9.16666 14.9475C9.16666 15.4077 9.53975 15.7808 9.99999 15.7808Z"
                    fill="#A0AEC0"
                  />
                  <path
                    d="M13.9392 18.2808H6.06084C5.53801 18.2496 5.04866 18.0132 4.69923 17.623C4.34981 17.2329 4.16859 16.7205 4.195 16.1974V3.80245C4.16859 3.27936 4.34981 2.767 4.69923 2.37685C5.04866 1.98669 5.53801 1.75031 6.06084 1.71912H13.9392C14.462 1.75031 14.9514 1.98669 15.3008 2.37685C15.6502 2.767 15.8314 3.27936 15.805 3.80245V16.1974C15.8314 16.7205 15.6502 17.2329 15.3008 17.623C14.9514 18.0132 14.462 18.2496 13.9392 18.2808ZM6.06084 2.55245C5.75941 2.58429 5.48247 2.73301 5.28944 2.9667C5.09641 3.20039 5.00267 3.50043 5.02834 3.80245V16.1974C5.00267 16.4995 5.09641 16.7995 5.28944 17.0332C5.48247 17.2669 5.75941 17.4156 6.06084 17.4474H13.9392C14.2406 17.4156 14.5175 17.2669 14.7106 17.0332C14.9036 16.7995 14.9973 16.4995 14.9717 16.1974V3.80245C14.9973 3.50043 14.9036 3.20039 14.7106 2.9667C14.5175 2.73301 14.2406 2.58429 13.9392 2.55245H6.06084Z"
                    fill="#A0AEC0"
                  />
                </svg>
              </div>
              {/* <input
                type="tel"
                name="phone"
                value={loginData.phone}
                onChange={handleChange}
                disabled={loginData.email.length > 0}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl 
                  ${loginData.email ? "opacity-50 cursor-not-allowed " : ""} 
                  ${errors.phone ? "border-red-500" : "border-gray-200"}
                `}
                placeholder="Phone"
              /> */}
              <PhoneInputAuto
                value={loginData.phone}
                disabled={loginData.email.length > 0}
                onChange={(v) => {
                  // keep the same update pattern as your other inputs
                  setLoginData(prev => ({ ...prev, phone: v }));
                  // clear any phone error if present
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                  if (errors.contact) setErrors(prev => ({ ...prev, contact: "" }));
                }}
                placeholder="phone"
                className={`focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-200"
                }`}
              />
            </div>
          </div>

          {/* 
          <p className="text-sm text-gray-500 text-center">
            Either email or phone is required. We'll send you an OTP to verify.
          </p> */}

          <button
            type="button"
            onClick={handleSendOtp}
            className="btn-gradient w-full cursor-pointer mt-5"
          >
            Login
          </button>
        </div>
        <div className="social-login-area">
          <p className="text-normal mb-[30px]">or continue with</p>
          <div className="social-login-wrapper ">
            <div className="social-media-btn gradient-border-btn">
              <SignInGoogle />
            </div>
            <div className="social-media-btn">
              <SignInLinkedin />
            </div>
            <div className="social-media-btn">
              <button className="group btn-inner-social bg-[#FFFFFF] relative flex justify-center items-center w-full transition-all cursor-pointer">
                {/* Subtle hover gradient */}
                <div className="absolute" />
                {/* Apple icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <g clipPath="url(#clip0_1137_734)">
                    <path
                      d="M15.2977 10.607C15.3249 13.5445 17.8749 14.5222 17.903 14.5347C17.8814 14.6034 17.4956 15.9278 16.5597 17.2954C15.7506 18.4779 14.9108 19.6561 13.5881 19.6808C12.2884 19.7045 11.8705 18.9098 10.3844 18.9098C8.89876 18.9098 8.43454 19.6561 7.20407 19.7045C5.9272 19.7529 4.95485 18.4256 4.13907 17.2476C2.4722 14.8376 1.19829 10.4375 2.90876 7.46731C3.75845 5.99231 5.2772 5.05841 6.92548 5.03435C8.17923 5.01044 9.36266 5.87778 10.1291 5.87778C10.895 5.87778 12.3331 4.83466 13.845 4.98778C14.478 5.01419 16.2545 5.24341 17.3953 6.91341C17.3036 6.97044 15.2756 8.15106 15.2977 10.607ZM12.855 3.39356C13.5328 2.5731 13.9891 1.4306 13.8647 0.294189C12.8875 0.333408 11.7059 0.945283 11.0052 1.76544C10.377 2.49153 9.82704 3.65403 9.97532 4.76794C11.0645 4.85231 12.177 4.2145 12.855 3.39356Z"
                      fill="black"
                    />
                  </g>

                  <defs>
                    <clipPath id="clip0_1137_734">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                {/* Text */}
                <span className="relative z-10 pl-[5px] text-[#000000]">
                  Apple
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center having-account-text">
          Don't have an account?{" "}
          {/* <Link href="/auth/signup" className="font-[600] hover:underline">
            Sign up
          </Link> */}
          <button
            onClick={() => setIsLogin(false)}
            className="font-semibold hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </AuthCard>
    </AuthBackground>
  );
}
