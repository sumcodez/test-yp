// components/PhoneInputAuto.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useAutoDialCode } from "../../../hooks/useDial";

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export default function PhoneInputAuto({
  value,
  onChange,
  disabled = false,
  placeholder = "Phone",
  className = "",
}: Props) {
  const { dialCode, loading } = useAutoDialCode();
  const [prefilled, setPrefilled] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);

  // Prefill once (only if input empty & not already edited)
  useEffect(() => {
    if (!hasFocused) return;
    if (!dialCode) return;
    if (prefilled) return;
    // if (value && value.trim().length > 0) return;
    // Only auto-insert if input is empty or hasn't been prefilled by user
    if ((!value || value.trim() === "") && !prefilled) {
      onChange(dialCode);
      setPrefilled(true);
    }
    // onChange(dialCode);
    // setPrefilled(true);
  }, [dialCode, value, onChange, prefilled, hasFocused]);

  const handleFocus = () => {
    setHasFocused(true);

    // If dial code is already available and input empty, insert it immediately
    if (dialCode && (!value || value.trim() === "") && !prefilled) {
      onChange(dialCode);
      setPrefilled(true);
    }
  };

  const handleBlur = () => {
    setHasFocused(false);

    // If user didn't type anything beyond the dial code, clear it so placeholder returns
    if (dialCode && (value === dialCode || value.trim() === dialCode)) {
      onChange("");
      setPrefilled(false);
    }
  };

  return (
    <div className="relative">
      {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none z-10">
        {loading ? "..." : dialCode || "+"}
      </div> */}

      <input
        type="tel"
        name="phone"
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => {
          setPrefilled(true); // user interaction overrides auto-prefill
          onChange(e.target.value);
        }}
        disabled={disabled}
        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        placeholder={placeholder}
      />
    </div>
  );
}
