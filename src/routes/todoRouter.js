const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTodo,
  getAllTodo,
  deleteTodo,
  updateTodo,
  filterTodos,
  searchTodos,
} = require("../controllers/controller");
const {
  loginUser,
  signupUser,
  getAllUsers,
  updateUser,
  uploadProfileImage,
  deleteUser,
} = require("../controllers/userController");
const {
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

// Function to create a router with io
const router = express.Router();

// User routes
router.post("/user/login", loginUser);
router.post("/user/signup", signupUser);
router.delete("/user/:id", authMiddleware, deleteUser);

// Define routes for /api/todos
router.get("/todo", authMiddleware, getAllTodo); // GET request for /api/todos
router.get("/todo/search", authMiddleware, searchTodos);
router.get("/todo/filter", authMiddleware, filterTodos);
router.post("/todo", authMiddleware, createTodo); // POST request for /api/todos
router.delete("/todo/:id", authMiddleware, deleteTodo); // DELETE request for /api/todos
router.put("/todo/:id", authMiddleware, updateTodo); // PUT request for /api/todos

// Message routes
router.get("/user/list", authMiddleware, getAllUsers); // GET all users list
router.get("/user/messages", authMiddleware, getMessages); // GET request to fetch messages between users
router.post("/user/messages", authMiddleware, sendMessage); // POST request to send a new message
router.put("/user/:id", authMiddleware, uploadProfileImage, updateUser);

module.exports = router;
