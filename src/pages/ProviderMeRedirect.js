import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProviderMeRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'provider' && user?.id) {
      navigate(`/providers/${user.id}`, { replace: true });
    } else {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  return null;
}


