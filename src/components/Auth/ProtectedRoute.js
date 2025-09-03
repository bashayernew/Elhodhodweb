import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { user, loading, userType: ctxUserType } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-hodhod-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-hodhod-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, compare against user's role or context fallback
  if (userType) {
    const effectiveRole = user?.role || ctxUserType || 'user';
    if (effectiveRole !== userType) {
      return <Navigate to={`/dashboard/${effectiveRole}`} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
