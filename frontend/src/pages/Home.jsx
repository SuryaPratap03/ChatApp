import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Home = ({ getUser, loggedUsername, setLoggedUsername, loggedUserID, setLoggedUserId }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is already logged in, redirect to the chat page
    if (loggedUsername) {
      navigate('/chat');
    }
  }, [loggedUsername, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080420]">
      <div className="bg-[#1c1c3c] p-8 rounded-xl shadow-2xl max-w-lg w-full">
        <h2 className="text-4xl font-bold text-center text-white mb-6">Welcome to the Chat App</h2>
        <p className="text-center text-gray-300 mb-6">
          Please login or signup to continue. 
        </p>
        <div className="flex justify-center space-x-4">
          <NavLink
            to="/login"
            className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 transition duration-200"
          >
            Signup
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Home;
