import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userStorage } from '../utils/localStorage';

export const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  return userStorage.getCurrentUser();
};


