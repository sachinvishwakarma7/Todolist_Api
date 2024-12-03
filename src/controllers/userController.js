const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signupUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    console.log(email, password, username);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
    });

    // Save the user to the database
    await newUser.save();

    // Respond with the token and user details
    res.status(201).json({
      //   token,
      message: "Signup successful.",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed.", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token (this is where the token is created)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Secret key from .env
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Send the token to the user
    res.status(200).json({
      token, // JWT token sent to the client
      message: "Login successful.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
};
