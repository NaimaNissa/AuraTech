import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { sendLoginWelcomeEmailSimple, sendSignupNotificationEmailSimple } from '../lib/emailService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

      // Send admin notification email about new signup
      try {
        console.log('📧 Sending admin notification about new signup...');
        await sendSignupNotificationEmailSimple({
          email: result.user.email,
          displayName: displayName,
          uid: result.user.uid
        });
        console.log('✅ Admin notification email sent successfully');
      } catch (notificationError) {
        console.error('⚠️ Failed to send admin notification email:', notificationError);
        // Don't fail the signup if notification fails
      }

      // Create dashboard notification for new user signup
      try {
        console.log('🔔 Creating dashboard notification for new user...');
        const notification = {
          type: 'new_user',
          priority: 'medium',
          title: 'New User Registration',
          message: `New user registered: ${displayName || result.user.email}`,
          details: {
            userId: result.user.uid,
            userName: displayName,
            userEmail: result.user.email,
            signupTime: new Date().toISOString()
          },
          actionUrl: '/customers',
          icon: '👤',
          color: '#3B82F6', // Blue for new users
          isRead: false,
          createdAt: new Date()
        };

        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, notification);
        console.log('✅ Dashboard notification created successfully');
      } catch (dashboardNotificationError) {
        console.error('⚠️ Failed to create dashboard notification:', dashboardNotificationError);
        // Don't fail the signup if notification fails
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

