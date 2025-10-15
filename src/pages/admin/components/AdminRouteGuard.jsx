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
      // Check if user is logged in and is Admin or Front-Desk
      const userId = localStorage.getItem('userId');
      const rawType = localStorage.getItem('userType') || '';
      const rawLevel = localStorage.getItem('userLevel') || '';

      // Normalize values for robust comparisons
      const normalizedType = rawType.toLowerCase().replace(/[\s_-]/g, ''); // e.g., 'front-desk' -> 'frontdesk'
      const normalizedLevel = rawLevel.toLowerCase().replace(/[\s_-]/g, ''); // e.g., 'Front-Desk' -> 'frontdesk'

      console.log('Auth Check:', { userId, userType: rawType.toLowerCase(), userLevel: rawLevel.toLowerCase() });
      console.log('Auth Normalized:', { normalizedType, normalizedLevel });

      const typeAllowed = normalizedType === 'admin' || normalizedType === 'employee' || normalizedType === 'frontdesk';
      const levelAllowed = normalizedLevel === 'admin' || normalizedLevel === 'frontdesk';

      // Validate access for Admin and Front-Desk
      if (userId && (typeAllowed || levelAllowed)) {
        setIsAuthenticated(true);
        console.log('Access granted');
      } else {
        setIsAuthenticated(false);
        console.log('Access denied - Invalid credentials');

        // Clear any invalid session data
        if (!userId || (!typeAllowed && !levelAllowed)) {
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
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with a message
  if (!isAuthenticated) {
    toast.error('Employee or Admin access required. Please log in.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default AdminRouteGuard;
