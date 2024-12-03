// src/routes/router.js
const express = require("express");
const router = express.Router();
const {
  createTodo,
  getAllTodo,
  deleteTodo,
  updateTodo,
  filterTodos,
  searchTodos,
} = require("../controllers/controller");
const authMiddleware = require("../middleware/authMiddleware");
const { loginUser, signupUser } = require("../controllers/userController");

// Define routes for /api/todos
router.get("/todo", authMiddleware, getAllTodo); // GET request for /api/todos
router.get("/todo/search", authMiddleware, searchTodos);
router.get("/todo/filter", authMiddleware, filterTodos);
router.post("/todo", authMiddleware, createTodo); // POST request for /api/todos
router.delete("/todo/:id", authMiddleware, deleteTodo); // DELETE request for /api/todos
router.put("/todo/:id", authMiddleware, updateTodo); // PUT request for /api/todos

// User routes
router.post("/user/login", loginUser);
router.post("/user/signup", signupUser);

module.exports = router;
