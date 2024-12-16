// Import required modules
const express = require("express");
const cors = require("cors");
const http = require("http");
const { urlencoded, json } = require("body-parser");
const { Server } = require("socket.io");
require("dotenv").config();

// Import custom modules
const connectMongoDB = require("./src/config/mongodb");
const router = require("./src/routes/todoRouter");
const { setupSocket } = require("./src/utils/socketManager");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const LOCAL_HOST = process.env.LOCAL_HOST;

// Create HTTP server and integrate with Socket.io
const httpServer = http.createServer(app);

const allowedOrigins = [LOCAL_HOST, "http://localhost:3000"];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"], // Allow these headers
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Connect to MongoDB
connectMongoDB();

// Setup Socket.io
setupSocket(io);

// Middleware
app.use(cors());
app.use(urlencoded({ extended: false })); // Parse URL-encoded data
app.use(json()); // Parse JSON data

// Logging Middleware for API routes
app.use("/api", (req, res, next) => {
  console.log(`Received a ${req.method} request at ${req.url}`);
  next();
});

// API Routes
app.use("/api", router);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for testing or further usage
module.exports = app;
