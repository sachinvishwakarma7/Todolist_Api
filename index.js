const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectMongoDB = require("./src/config/mongodb");
const { urlencoded, json } = require("body-parser");
const router = require("./src/routes/todoRouter");

const app = express();
const PORT = process.env.PORT || 3000;

// connect mogodb
connectMongoDB();

app.use(cors()); // Use this after the variable declaration

// Middleware to parse incoming requests
app.use(urlencoded({ extended: false }));
app.use(json()); // Ensure this is before route handling

app.use("/api",(req, res, next) => {
  console.log(`Received a ${req.method} request at ${req.url}`);
  next();  // This will cause "Cannot set headers after they are sent" because of `res.send()` above.
},router);

// app.use("/api/user/signup", signupUser)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
