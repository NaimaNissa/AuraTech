import { useAuth } from '../contexts/AuthContext';
import AuthPage from '../pages/AuthPage';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? children : <AuthPage />;
}

