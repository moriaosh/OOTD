import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Check both context state and localStorage for authentication
  const tokenExists = authAPI.isAuthenticated();
  const userExists = !!user || !!authAPI.getCurrentUser();
  const actuallyAuthenticated = tokenExists && userExists;

  console.log('🔵 ProtectedRoute check:', {
    loading,
    isAuthenticated,
    tokenExists,
    userExists,
    actuallyAuthenticated,
    hasUser: !!user,
    hasToken: tokenExists
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!actuallyAuthenticated) {
    console.log('🔴 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🟢 ProtectedRoute: Authenticated, rendering children');
  return children;
};

export default ProtectedRoute;

