import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import PasswordSetupForm from './PasswordSetupForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => {}} />;
  }

  if (currentUser?.needsPasswordSetup) {
    return (
      <PasswordSetupForm
        email={currentUser.email}
        onSuccess={() => {}}
        onBack={() => {}}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

