import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import { io } from "socket.io-client";

const Chat = ({ loggedUsername, loggedUserID }) => {
  const navigate = useNavigate();
  const [allMessages, setAllMessages] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const socketRef = useRef();

  // Redirect to login page if user is not logged in
  useEffect(() => {
    if (!loggedUsername) {
      navigate("/");
    }
  }, [loggedUsername, navigate]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      socket.emit("setup", loggedUserID);
    });

    socket.on("allMessagesfromdb", (messages) => {
      setAllMessages(messages);
    });

    socket.on("receivedMessage", (message) => {
      setAllMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [loggedUserID]);

  // Fetch all users excluding the logged-in user
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/allUsers", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setAllContacts(data.allUsers.filter((user) => user._id !== loggedUserID));
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (error) {
        console.error("Error getting all users:", error.message);
      }
    };

    getAllUsers();
  }, [loggedUserID]);

  // Fetch messages for selected user
  useEffect(() => {
    if (selectedUser) {
      const data = {
        senderId: loggedUserID,
        receiverId: selectedUser._id,
      };
      socketRef.current.emit("allMessages", data);
    }
  }, [selectedUser, loggedUserID]);

  // Scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages]);

  // Handle message sending
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const data = {
      message,
      senderId: loggedUserID,
      receiverId: selectedUser._id,
    };

    socketRef.current.emit("message", data);
    setAllMessages((prev) => [...prev, { ...data, senderId: loggedUserID }]);
    setMessage("");
  };

  const handleSelectedUser = (contact) => {
    setSelectedUser(contact);
    setAllMessages([]); // Clear previous messages when a new user is selected
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="bg-white w-full md:w-1/3 p-4 overflow-y-auto border-b md:border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Contacts</h2>
        {allContacts.map((contact) => (
          <div
            key={contact._id}
            className={`p-3 cursor-pointer rounded-md ${
              selectedUser?._id === contact._id ? "bg-blue-200" : "hover:bg-gray-200"
            }`}
            onClick={() => handleSelectedUser(contact)}
          >
            {contact.username}
          </div>
        ))}
      </div>
      <div className="flex flex-col w-full md:w-2/3 p-4">
        <div className="flex-grow overflow-auto mb-4">
          {allMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.senderId === loggedUserID ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`p-3 rounded-md ${
                  msg.senderId === loggedUserID ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="flex" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-grow p-2 border rounded-md"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded-md">
            <IoMdSend size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
