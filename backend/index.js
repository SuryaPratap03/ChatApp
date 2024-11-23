import express from 'express';
import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import User from './models/UserModels.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import { Server} from 'socket.io';
import { createServer} from 'http';
import { Message } from './models/MessageModel.js';
import upload from './middlewares/upload.js';

configDotenv();

const app = express();

// Connect to MongoDB
mongoose
  .connect(`${process.env.DB}`)
  .then(() => console.log('DB CONNECTED'))
  .catch((error) => {
    console.log('Error connecting DB:', error);
  });

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend origin
  credentials: true, // Allow credentials (cookies)
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Enable cookie handling

// Routes
app.get('/', async(req, res) => {
  return res.send('Hello world');
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if username or email already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'E-mail already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ userID: newUser._id,username:newUser.username }, process.env.SecretKey, {
      expiresIn: '24h',
    });

    // Send token as a cookie and respond
    return res
      .status(200)
      .cookie('token', token, { httpOnly: true, secure: false }) // Set cookie options
      .json({ message: 'New user created', id: newUser?._id ,username:newUser.username});
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/login', async (req, res) => {
    const {password, email } = await req.body;
  
    try {
      const UserExists = await User.findOne({ email });
      if (!UserExists) {
        return res.status(400).json({ message: 'Enter Valid Credentials' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.compare(password,UserExists.password );
      if(!hashedPassword){
        return res.status(400).json({ message: 'Enter Valid Credentials' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ userID: UserExists._id,username:UserExists.username }, process.env.SecretKey, {
        expiresIn: '24h',
      });
  
      // Send token as a cookie and respond
      return res
        .status(200)
        .cookie('token', token, { httpOnly: true, secure: false }) // Set cookie options
        .json({ message: 'User Logged In', id: UserExists?._id ,username:UserExists?.username});
    } catch (error) {
      console.error('Error during registration:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/allUsers', async (req, res) => {
    try {
      // Get the token from cookies
      const { token } = req.cookies;
  
      // If there's no token, return an error
      if (!token) {
        return res.status(400).json({ message: 'No token found' });
      }
  
      // Decode the token to get the logged-in user's ID
      const decoded = await jwt.verify(token, process.env.SecretKey);
      const loggedUserId = decoded.userID;
  
      // Get all users and exclude the password field while filtering out the logged-in user
      const allUsers = await User.find({ _id: { $ne: loggedUserId } }).select('-password');
  
      return res.status(200).json({ message: 'All users', allUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: 'Server error', error });
    }
  });
  
app.get('/profile',async(req,res)=>{
    try{
        const {token} = await req.cookies;
        if(!token){
            return res.status(400).json('No token Found');
        }
        const decoded = await jwt.verify(token,process?.env?.SecretKey);
        return res.status(200).json(decoded)
    }catch(error){
        return res.status(500).json(error);
    }
})

// Start server
const server = createServer(app);
server.listen(process.env.PORT, () => {
  console.log('Server Started at PORT', process.env.PORT);
});


//socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST','PATCH','PUT'],
    credentials: true,
  },
});
// Store user ID to socket ID mapping
const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log('connected', socket.id);

  // Associate the user ID with the socket ID
  socket.on('setup', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} is associated with socket ${socket.id}`);
  });

  socket.on('allMessages', async (data) => {
    try {
      // Find all messages between sender and receiver
      const msgs = await Message.find({
        $or: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId }
        ]
      }).sort({ createdAt: 1 }); // Sorting by timestamp (ascending)
  
      // Send the messages to both users
      const senderSocket = userSocketMap.get(data.senderId);
      const receiverSocket = userSocketMap.get(data.receiverId);
      
       
      if (senderSocket) {
        io.to(senderSocket).emit('allMessagesfromdb', msgs);
      }
      if (receiverSocket) {
        io.to(receiverSocket).emit('allMessagesfromdb', msgs);
      }
    } catch (error) { 
      console.error("Error fetching messages:", error);
    } 
  });
  
  // Listen for incoming messages 
  socket.on('message', async(data) => {
    console.log('messageIncoming',data);
     
    const { receiverId, message, senderId } = data;
    const newmessage = await Message({receiverId,senderId,message});
    await newmessage.save(); 
    // Retrieve the receiver's socket ID from the hashmap
    const receiverSocketId = userSocketMap.get(receiverId);

    if (receiverSocketId) {
      // Send the message to the specific recipient
      io.to(receiverSocketId).emit('receivedMessage', data);
    } else {
      console.log(`User ${receiverId} is not connected`);
    }
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('disconnected', socket.id);

    // Remove the socket ID from the hashmap
    for (const [userId, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) { 
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected and removed from the map`);
        break;
      }
    }
  });
});
