const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const path = require('path');
const conversationRoutes = require("./routes/conversationRoutes");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "/*" } });

// Middleware setup (order matters!)
app.use(express.json());
app.use(cors());

// Session middleware
const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

// Static files - Updated to serve from client/public
app.use(express.static(path.join(__dirname, "../client/public")));

// MongoDB connection with better error handling
const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/chatApp");
        
        console.log(' Connected to MongoDB:', conn.connection.host);
        console.log(' Database name:', conn.connection.name);
    } catch (error) {
        console.error(' MongoDB connection error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 SOLUTIONS:');
            console.log('1. Run Command Prompt as Administrator');
            console.log('2. Run: net start MongoDB');
            console.log('3. Or manually start: mongod --dbpath "C:\\data\\db"');
        }
        
        console.log('⚠️ Server running without database connection');
    }
};

// Call the connection function
connectDB();

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    console.log('Checking authentication for:', req.session.user);
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Create user schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// Updated message schema with room field
const messageSchema = new mongoose.Schema({
    sender: String,
    message: String,
    room: String, // Added room field for sections
    timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

// Root route to serve login page - Updated path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/login.html'));
});

// Dashboard route with authentication - Updated path
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/dashboard.html'));
});

// NEW: Get messages for specific room/section
app.get('/messages/:room', isAuthenticated, async (req, res) => {
    try {
        const { room } = req.params;
        const messages = await Message.find({ room: room })
            .sort({ timestamp: 1 }) // Sort by oldest first
            .limit(50); // Limit to last 50 messages
        
        res.json({
            success: true,
            room: room,
            messages: messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEW: Get all available rooms/sections
app.get('/rooms', isAuthenticated, async (req, res) => {
    try {
        const rooms = await Message.distinct('room');
        res.json({
            success: true,
            rooms: rooms.length > 0 ? rooms : ['general']
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: error.message });
    }
});
// NEW: Serve conversation routes
app.use("/api/conversations", conversationRoutes);

// DATABASE CHECK ROUTES
// Check database connection
app.get('/check-db', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        const userCount = await User.countDocuments();
        const messageCount = await Message.countDocuments();
        
        res.json({
            status: 'success',
            database: {
                state: states[dbState],
                connection: dbState === 1 ? 'Connected' : 'Not Connected'
            },
            collections: {
                users: userCount,
                messages: messageCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// View all users (for debugging)
app.get('/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords
        res.json({
            status: 'success',
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// View all messages (for debugging) - Updated with room filtering
app.get('/debug/messages', async (req, res) => {
    try {
        const { room } = req.query; // Optional room filter
        const query = room ? { room: room } : {};
        
        const messages = await Message.find(query)
            .sort({ timestamp: -1 })
            .limit(50);
            
        res.json({
            status: 'success',
            room: room || 'all',
            count: messages.length,
            messages: messages
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Signup route
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: "User already exists with this email or username" 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        req.session.user = username;
        console.log('User registered and session created:', username);
        
        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            username: username
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        req.session.user = user.username;
        console.log('Login successful, session created:', user.username);
        
        res.json({ 
            success: true, 
            username: user.username,
            message: "Login successful"
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');

        // Store token and expiry in user document
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Set up email sender (use Gmail or your SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'Your_mail@gmail.com',
                pass: 'App password '  
            }
        });

        const resetURL = `http://localhost:3000/reset-password.html?token=${token}`;

        await transporter.sendMail({
            to: user.email,
            from: 'no-reply@yourdomain.com',
            subject: 'Password Reset',
            html: `<p>You requested a password reset</p>
                   <p><a href="${resetURL}">Click here to reset your password</a></p>`
        });

        res.json({ message: 'Password reset link sent to email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending email' });
    }
});

app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }  // Not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
});



// Get user profile
app.get("/user", async (req, res) => {
    if (req.session.user) {
        try {
            const user = await User.findOne({ username: req.session.user });
            res.json({ 
                username: req.session.user,
                email: user.email
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Socket.io setup with session sharing
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// UPDATED Socket.io implementation with room support
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle joining a room/section
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.request.session?.user || 'Unknown'} joined room: ${roomName}`);
        
        // Send recent messages for this room when user joins
        Message.find({ room: roomName })
            .sort({ timestamp: 1 })
            .limit(20)
            .then(messages => {
                socket.emit('room-messages', {
                    room: roomName,
                    messages: messages
                });
            })
            .catch(err => console.error('Error loading room messages:', err));
    });
    
    // Handle leaving a room
    socket.on('leave-room', (roomName) => {
        socket.leave(roomName);
        console.log(`User left room: ${roomName}`);
    });
    
    // Handle messages with room information - UPDATED
    socket.on('message', async (data) => {
        if (socket.request.session.user) {
            const username = socket.request.session.user;
            
            // Handle both old format (just string) and new format (object with room)
            let message, room;
            if (typeof data === 'string') {
                message = data;
                room = 'general'; // Default room for old clients
            } else {
                message = data.message;
                room = data.room || 'general';
            }
            
            // Save message to database with room information
            try {
                const newMessage = new Message({
                    sender: username,
                    message: message,
                    room: room
                });
                await newMessage.save();
                
                // Broadcast message only to users in the same room
                const messageData = {
                    user: username,
                    text: message,
                    room: room,
                    timestamp: newMessage.timestamp
                };
                
                // Send to all users in the specific room
                io.to(room).emit('message', messageData);
                
                console.log(`Message saved and sent to room ${room}:`, messageData);
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', { message: 'Failed to save message' });
            }
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
server.listen(3000, () => {
    console.log(" Server running on http://localhost:3000");
    console.log(" Database check: http://localhost:3000/check-db");
    console.log(" Debug users: http://localhost:3000/debug/users");
    console.log(" Debug messages: http://localhost:3000/debug/messages");
    console.log(" Debug messages by room: http://localhost:3000/debug/messages?room=general");
    console.log(" Available rooms: http://localhost:3000/rooms");
});

// Serve React frontend (fallback for client-side routing)
// app.get("/*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/public", "login.html"));
// });
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/public", "login.html"));
});
