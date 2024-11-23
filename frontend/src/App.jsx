import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Signup from "./pages/Signup";
import { useEffect, useState } from "react";
import Home from "./pages/Home";

function App() {
  const [loggedUsername, setLoggedUsername] = useState("");
  const [loggedUserID, setLoggedUserId] = useState("");

  // Fetch user data and set the username and ID
  const getUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/profile", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent with the request
      });
      const data = await response.json();
      
      // Update state with the fetched data (username and user ID)
      if (data.username && data.userID) {
        setLoggedUsername(data.username);
        setLoggedUserId(data.userID);
      }
    } catch (error) {
      console.log("Error getting user", error);
    }
  };

  // Use effect to fetch user data when the component mounts
  useEffect(() => {
    getUser();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              getUser={getUser}
              loggedUsername={loggedUsername}
              setLoggedUsername={setLoggedUsername}
              loggedUserID={loggedUserID}
              setLoggedUserId={setLoggedUserId}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              loggedUsername={loggedUsername}
              setLoggedUsername={setLoggedUsername}
              loggedUserID={loggedUserID}
              setLoggedUserId={setLoggedUserId}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              loggedUsername={loggedUsername}
              setLoggedUsername={setLoggedUsername}
              loggedUserID={loggedUserID}
              setLoggedUserId={setLoggedUserId}
            />
          }
        />
        <Route
          path="/chat"
          element={
            <Chat
              loggedUsername={loggedUsername}
              setLoggedUsername={setLoggedUsername}
              loggedUserID={loggedUserID}
              setLoggedUserId={setLoggedUserId}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
