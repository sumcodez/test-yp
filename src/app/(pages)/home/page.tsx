
"use client";
import React, { useState } from 'react';
import { LogOut, Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const [user] = useState({ name: 'John Doe', role: 'Administrator' });
  const { data: session } = useSession();

  // const userData = localStorage.getItem("user");
  // console.log("User data from localStorage:", userData);

  const handleLogout = async() => {
    try {
      // Hit your backend logout proxy to clear httpOnly cookies
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear any optional local client state
      localStorage.removeItem("user");
      localStorage.removeItem("authenticated");
      localStorage.removeItem("pending_contact");

      // Logout from NextAuth fully
      await signOut({ callbackUrl: "/auth" });

    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  

  const stats = [
    { label: 'Total Users', value: '2,543', icon: Users, color: 'bg-blue-500' },
    { label: 'Revenue', value: '$45,231', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Orders', value: '1,234', icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Growth', value: '+23.5%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {session?.user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome to the Dashboard</h1>
      </main>
    </div>
  );
}
