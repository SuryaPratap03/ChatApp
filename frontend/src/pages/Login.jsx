import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Login = ({ setLoggedUsername, setLoggedUserId, loggedUsername, loggedUserID }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // State for error message
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is already logged in, redirect to chat page
    if (loggedUsername) {
      navigate('/chat');
    }
  }, [loggedUsername, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Ensures cookies are sent with the request
      });

      const data = await response.json();

      if (data.message === 'User Logged In') {
        // Update the state with the logged-in user data
        setLoggedUsername(data.username);
        setLoggedUserId(data.userID);

        // Redirect to the chat page after login
        navigate('/chat');
      } else{
        // If the backend sends an error message, display it
        setError(data.message);
      }

      console.log("Login response", data);
    } catch (error) {
      console.log('Error logging in', error);
      setError('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080420]">
      <div className="bg-[#1c1c3c] p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-4 border-2 border-[#080420] bg-[#1c1c3c] text-white rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-4 border-2 border-[#080420] bg-[#1c1c3c] text-white rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#080420] text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}

        <p className="mt-6 text-center text-gray-300">
          Don't have an account?{' '}
          <NavLink to="/signup" className="text-indigo-500 hover:underline">
            Register here
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
