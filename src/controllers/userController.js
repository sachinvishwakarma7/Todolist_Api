const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require("multer");
const { addToBlacklist } = require("../utils/socketManager");

const storage = multer.memoryStorage();

const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([{ name: "image" }]);

const emailValidator = /^[a-zA-Z][-_.a-zA-Z0-9]{3,29}@g(oogle)?mail.com$/;

const signupUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    // Check if user already exists

    if (!username) {
      return res.status(400).json({
        message: "Username is required!.",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required!.",
      });
    }

    if (!emailValidator.test(email)) {
      return res.status(400).json({
        message: "Email is not valid!.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required!.",
      });
    }

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

    res.status(201).json({
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

    if (!emailValidator.test(email)) {
      return res.status(400).json({
        message: "Email is not valid!.",
      });
    }

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
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send the token to the user
    res.status(200).json({
      token,
      message: "Login successful.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, profileImage, changePassword } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (profileImage) updateData.profileImage = profileImage;
    if (changePassword) {
      const hashedPassword = await bcrypt.hash(changePassword, 10);
      updateData.password = hashedPassword;
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("_id username email profileImage");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users except the logged-in user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id username email profileImage"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user.", error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  uploadProfileImage,
};
