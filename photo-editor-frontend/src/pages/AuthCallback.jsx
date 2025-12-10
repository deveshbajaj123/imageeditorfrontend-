import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storage } from '../utils/storage';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // OAuth failed
      console.error('OAuth error:', error);
      navigate('/login?error=auth_failed');
      return;
    }

    if (token) {
      // Save token to localStorage
      storage.setToken(token);
      
      // Fetch user data
      fetchUserData(token);
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        storage.setUser(data.user);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      storage.removeToken();
      navigate('/login?error=auth_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}