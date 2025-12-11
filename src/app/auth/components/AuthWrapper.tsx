'use client'
import LoginPage from './Login';
import SignupPage from './SignUp';
import { useState } from "react";
const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
 <div>
      {isLogin ? (
        <LoginPage isLogin={isLogin} setIsLogin={setIsLogin} />
      ) : (
        <SignupPage isLogin={isLogin} setIsLogin={setIsLogin} />
      )}
    </div>
  )
}

export default AuthWrapper
