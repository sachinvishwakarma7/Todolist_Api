const client = require("../config/db");

const getAllTodo = (req, res) => {
  const query = "SELECT * FROM todo";
  client.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch todos" });
    }
    res.status(200).json(results);
  });
};

const createTodo = (req, res) => {
  // Extracting data from the request body
  const { title, description, completed, category, priority } = req.body;

  // Validation: Check if required fields are present
  if (!title || !description || completed === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Creating a new todo item
  const newTodo = {
    title,
    description,
    completed,
    category,
    priority,
    created_at: new Date(), // Automatically setting the current date
  };

  // SQL query to insert data into the database
  client.query("INSERT INTO todo SET ?", newTodo, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Responding with the newly created todo
    res.status(201).json({ id: result.insertId, ...newTodo });
  });
};

const deleteTodo = (req, res) => {
  const { id } = req.params; // Extracting 'id' from the request parameters

  // Validation: Check if the 'id' is provided
  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  // SQL query to delete the todo item by id
  client.query("DELETE FROM todo WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if any row was deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo item not found" });
    }

    res.status(200).json({ message: "Todo item deleted successfully" });
  });
};

const updateTodo = (req, res) => {
  const { id } = req.params; // Extract 'id' from the request parameters
  const { title, description, completed, category, priority } = req.body; // Extract fields from the request body

  // Validation: Check if the 'id' and fields to update are provided
  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  if (!title && !description && completed === undefined) {
    return res
      .status(400)
      .json({ error: "At least one field is required to update" });
  }

  // Construct the SQL query dynamically based on the fields provided
  let fields = [];
  let values = [];

  if (title) {
    fields.push("title = ?");
    values.push(title);
  }

  if (description) {
    fields.push("description = ?");
    values.push(description);
  }

  if (completed !== undefined) {
    fields.push("completed = ?");
    values.push(completed);
  }

  if (category) {
    fields.push("category = ?");
    values.push(category);
  }

  if (priority) {
    fields.push("priority = ?");
    values.push(priority);
  }

  values.push(id); // Add 'id' as the last parameter for the WHERE clause

  const sqlQuery = `UPDATE todo SET ${fields.join(", ")} WHERE id = ?`;

  // Execute the query to update the todo item
  client.query(sqlQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if a row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo item not found" });
    }

    res.status(200).json({ message: "Todo item updated successfully" });
  });
};

module.exports = {
  getAllTodo,
  createTodo,
  deleteTodo,
  updateTodo,
};
