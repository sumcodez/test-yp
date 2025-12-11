'use client';
import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SignInGoogle from '../components/sign-in-google';
import SignInLinkedin from '../components/sign-in-linkedin';
import { ToastContainer, toast } from 'react-toastify';

interface LoginData {
  email: string;
  phone: string;
}

interface LoginErrors {
  email?: string;
  phone?: string;
  contact?: string;
}

export default function LoginPage() {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<LoginErrors>({});

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Either email or phone must be provided
    if (!loginData.email.trim() && !loginData.phone.trim()) {
      newErrors.contact = 'Please provide either an email or phone number';
    }

    // If email is provided, validate format
    if (loginData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // If phone is provided, validate format
    if (loginData.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(loginData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async() => {
    if (validateForm()) {
      console.log('Sending OTP to:', loginData.email || loginData.phone);
      // Here you would send OTP to the user's email/phone
      // Then redirect to OTP verification page
      // alert('OTP sent successfully! Redirecting to verification page...');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await res.json();
        console.log('Login API response:', data);

        if (!res.ok) {
          toast.error(data.message || 'Failed to send OTP. Please try again.');
          return;
        }

        const contactInfo = loginData.email || loginData.phone;
        console.log('OTP sent to:', contactInfo);
        
        router.push(`/auth/verify${loginData.email ? `?email=${encodeURIComponent(loginData.email)}` : ''}${loginData.phone ? `${loginData.email ? '&' : '?'}phone=${encodeURIComponent(loginData.phone)}` : ''}`);
      } catch (error) {
        // setErrors({ contact: 'An unexpected error occurred. Please try again later.' });
        toast.error('An unexpected error occurred. Please try again later.');
        console.error('Error during login API call:', error);
      }
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in with OTP verification</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={loginData.phone}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {errors.contact && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm font-medium">{errors.contact}</p>
            </div>
          )}

          <p className="text-sm text-gray-500 text-center">
            Either email or phone is required. We'll send you an OTP to verify.
          </p>

          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            Send OTP
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SignInGoogle/>

            <SignInLinkedin />
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-purple-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}