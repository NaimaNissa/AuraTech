import { useState } from 'react';
import SignIn from '../components/auth/SignIn';
import SignUp from '../components/auth/SignUp';

export default function AuthPage({ onNavigate }) {
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isSignIn ? (
          <SignIn onToggleMode={toggleMode} onNavigate={onNavigate} />
        ) : (
          <SignUp onToggleMode={toggleMode} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

