import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Signup = ({ setLoggedUsername, setLoggedUserId, loggedUsername, loggedUserID }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');  // State for error message
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is already logged in, redirect to chat page
    if (loggedUsername) {
      navigate('/chat');
    }
  }, [loggedUsername, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
        credentials: 'include', // Ensures cookies are sent with the request
      });

      const data = await response.json();

      if (data.message === 'New user created') {
        // Update the state with the logged-in user data
        setLoggedUsername(data?.username);
        setLoggedUserId(data?.userID);

        // Redirect to the chat page after Signup
        navigate('/chat');
      } else{
        // If an error is returned from backend, display it
        setError(data.message);
      }

      console.log("Signup response", data);
    } catch (error) {
      console.log('Error signing up', error.message);
      setError('An error occurred while signing up. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080420]">
      <div className="bg-[#1c1c3c] p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-6">
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
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
            Sign Up
          </button>
        </form>
        
        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}

        <p className="mt-6 text-center text-gray-300">
          Already have an account?{' '}
          <NavLink to="/login" className="text-indigo-500 hover:underline">
            Login here
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
