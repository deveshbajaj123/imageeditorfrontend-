import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetchUserData(token);
    } else {
      // No token or error, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://image-api-fschcebmh0habtd6.centralindia-01.azurewebsites.net/api'}/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      navigate('/login?error=failed_to_fetch_user');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}