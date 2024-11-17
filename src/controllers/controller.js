const { json } = require("body-parser");
const client = require("../config/db");
const Todo = require("../models/Todo");

// const getAllTodo = (req, res) => {
//   const query = "SELECT * FROM todo";
//   client.query(query, (err, results) => {
//     console.log("error--->", err);
//     if (err) {
//       return res.status(500).json({ error: "Failed to fetch todos" });
//     }
//     res.status(200).json(results);
//   });
// };

const getAllTodo = async (req, res) => {
  try {
    // const newTodo = new Todo.create(req.body);
    // const savedTodo = await newTodo.save();
    const todoData = await Todo.find();
    res.status(200).json(todoData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

const searchTodos = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the request
    // Use MongoDB's regex to perform a case-insensitive search
    const todos = await Todo.find({
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

const filterTodos = async (req, res) => {
  try {
    const { priority, completed, category } = req.query;

    // Build the query object dynamically
    const query = {};
    if (priority) {
      query.priority = priority;
    }
    if (completed) {
      query.completed = completed === "true"; // Convert string to boolean
    }
    if (category) {
      query.category = category;
    }

    // Fetch the filtered todos from the database
    const todos = await Todo.find(query);
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const createTodo = (req, res) => {
//   // Extracting data from the request body
//   const { title, description, completed, category, priority } = req.body;

//   // Validation: Check if required fields are present
//   if (!title || !description || completed === undefined) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Creating a new todo item
//   const newTodo = {
//     title,
//     description,
//     completed,
//     category,
//     priority,
//     created_at: new Date(), // Automatically setting the current date
//   };

//   // SQL query to insert data into the database
//   client.query("INSERT INTO todo SET ?", newTodo, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     // Responding with the newly created todo
//     res.status(201).json({ id: result.insertId, ...newTodo });
//   });
// };

const createTodo = async (req, res) => {
  try {
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
    };

    const todoData = await Todo.create(newTodo);
    res.status(201).json(todoData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const deleteTodo = (req, res) => {
//   const { id } = req.params; // Extracting 'id' from the request parameters

//   // Validation: Check if the 'id' is provided
//   if (!id) {
//     return res.status(400).json({ error: "ID is required" });
//   }

//   // SQL query to delete the todo item by id
//   client.query("DELETE FROM todo WHERE id = ?", [id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     // Check if any row was deleted
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Todo item not found" });
//     }

//     res.status(200).json({ message: "Todo item deleted successfully" });
//   });
// };

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id); // Delete the document by ID
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const updateTodo = (req, res) => {
//   const { id } = req.params; // Extract 'id' from the request parameters
//   const { title, description, completed, category, priority } = req.body; // Extract fields from the request body

//   // Validation: Check if the 'id' and fields to update are provided
//   if (!id) {
//     return res.status(400).json({ error: "ID is required" });
//   }

//   if (!title && !description && completed === undefined) {
//     return res
//       .status(400)
//       .json({ error: "At least one field is required to update" });
//   }

//   // Construct the SQL query dynamically based on the fields provided
//   let fields = [];
//   let values = [];

//   if (title) {
//     fields.push("title = ?");
//     values.push(title);
//   }

//   if (description) {
//     fields.push("description = ?");
//     values.push(description);
//   }

//   if (completed !== undefined) {
//     fields.push("completed = ?");
//     values.push(completed);
//   }

//   if (category) {
//     fields.push("category = ?");
//     values.push(category);
//   }

//   if (priority) {
//     fields.push("priority = ?");
//     values.push(priority);
//   }

//   values.push(id); // Add 'id' as the last parameter for the WHERE clause

//   const sqlQuery = `UPDATE todo SET ${fields.join(", ")} WHERE id = ?`;

//   // Execute the query to update the todo item
//   client.query(sqlQuery, values, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     // Check if a row was updated
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Todo item not found" });
//     }

//     res.status(200).json({ message: "Todo item updated successfully" });
//   });
// };

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    });
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
