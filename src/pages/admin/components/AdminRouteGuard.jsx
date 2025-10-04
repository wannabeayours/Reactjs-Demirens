import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const AdminRouteGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      // Check if user is logged in and is an admin
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      const userLevel = localStorage.getItem('userLevel');

      console.log('Auth Check:', { userId, userType, userLevel });

      // Validate admin access
      if (userId && userType === 'admin' && userLevel === 'Admin') {
        setIsAuthenticated(true);
        console.log('Admin access granted');
      } else {
        setIsAuthenticated(false);
        console.log('Admin access denied - Invalid credentials');
        
        // Clear any invalid session data
        if (userType !== 'admin' || userLevel !== 'Admin') {
          localStorage.removeItem('userId');
          localStorage.removeItem('fname');
          localStorage.removeItem('lname');
          localStorage.removeItem('userType');
          localStorage.removeItem('userLevel');
        }
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34699a] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with a message
  if (!isAuthenticated) {
    toast.error('Admin access required. Please log in as an administrator.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default AdminRouteGuard;
