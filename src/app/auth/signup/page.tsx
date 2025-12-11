'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import SignInGoogle from '../components/sign-in-google';
import PhoneInputAuto from '../components/PhoneInputAuto';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  contact?: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = 'Please provide either an email or phone number';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Here you would send data to backend and then redirect
      alert('Account created successfully! Redirecting to login...');

      // Redirect to login page
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Join Us</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
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
            {/* <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="+1 (555) 000-0000"
              />
            </div> */}

            <PhoneInputAuto
              value={formData.phone}
              onChange={(v) => {
                // keep the same update pattern as your other inputs
                setFormData(prev => ({ ...prev, phone: v }));
                // clear any phone error if present
                if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                if (errors.contact) setErrors(prev => ({ ...prev, contact: "" }));
              }}
              disabled={!!formData.email} // mirror existing behavior: disable when email is present
              placeholder="+1 (555) 000-0000"
              className={`focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                errors.phone ? "border-red-500" : "border-gray-200"
              }`}
            />
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
            <span className="text-red-500">*</span> Name is required. Either email or phone is required.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-linear-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Create Account
          </button>

          {/* Social Signup Button placed underneath */}
          <div className="mt-4 flex justify-center">
            <SignInGoogle/>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}