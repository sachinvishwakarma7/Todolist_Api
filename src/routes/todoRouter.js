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

// Define routes for /api/todos
// router.get("/", getAllTodo); // GET request for /api/todos
router.get("/", getAllTodo); // GET request for /api/todos
router.get("/search", searchTodos);
router.get("/filter", filterTodos);
router.post("/", createTodo); // POST request for /api/todos
router.delete("/:id", deleteTodo); // DELETE request for /api/todos
router.put("/:id", updateTodo); // PUT request for /api/todos

module.exports = router;
