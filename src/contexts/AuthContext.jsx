import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { sendLoginWelcomeEmailSimple } from '../lib/emailService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: displayName
      });
      
      // Send welcome email after successful signup
      try {
        console.log('🎉 User signed up successfully, sending welcome email...');
        await sendLoginWelcomeEmailSimple({
          email: result.user.email,
          displayName: displayName,
          uid: result.user.uid
        });
        console.log('✅ Welcome email sent successfully');
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }
      
      return result;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Send welcome email after successful login
      try {
        console.log('🎉 User logged in successfully, sending welcome email...');
        await sendLoginWelcomeEmailSimple({
          email: result.user.email,
          displayName: result.user.displayName,
          uid: result.user.uid
        });
        console.log('✅ Welcome email sent successfully');
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't fail the login if email fails
      }
      
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

