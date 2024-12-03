const Todo = require("../models/Todo");

// Fetch all todos for the authenticated user
const getAllTodo = async (req, res) => {
  try {
    const todoData = await Todo.find({ user: req.user.id }); // Use the user ID from the JWT token
    res.status(200).json(todoData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

// Search todos for the authenticated user
const searchTodos = async (req, res) => {
  try {
    const { query } = req.query;
    const todos = await Todo.find({
      user: req.user.id, // Ensure the todos belong to the authenticated user
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching search results" });
  }
};

// Filter todos for the authenticated user
const filterTodos = async (req, res) => {
  try {
    const { priority, completed, category } = req.query;

    const query = { user: req.user.id }; // Ensure the todos belong to the authenticated user
    if (priority) {
      query.priority = priority;
    }
    if (completed) {
      query.completed = completed === "true";
    }
    if (category) {
      query.category = category;
    }

    const todos = await Todo.find(query);
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new todo for the authenticated user
const createTodo = async (req, res) => {
  try {
    const { title, description, completed, category, priority } = req.body;

    if (!title || !description || completed === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTodo = {
      title,
      description,
      completed,
      category,
      priority,
      user: req.user.id, // Associate the todo with the authenticated user
    };

    console.log("req.user.id", req.user.id);

    const todoData = await Todo.create(newTodo);
    res.status(201).json(todoData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a todo for the authenticated user
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      user: req.user.id,
    }); // Only delete todos belonging to the authenticated user
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a todo for the authenticated user
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user.id }, // Only update todos belonging to the authenticated user
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTodo,
  searchTodos,
  filterTodos,
  createTodo,
  deleteTodo,
  updateTodo,
};
