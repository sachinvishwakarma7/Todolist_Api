// const { default: mongoose } = require("mongoose");

// const url = process.env.MONGODB_URL;

// console.log(process.env.MONGODB_URL)

// const connectMongoDB = () => {
//   mongoose
//     .connect(url)
//     .then(() => {
//       console.log("mongo database connected!");
//     })
//     .catch((error) => {
//       console.log("Erron mongo database connection!", error);
//     });
// };

// module.exports = connectMongoDB;


const mongoose = require("mongoose");

let isConnected = false;

const connectMongoDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected.");
    return;
  }
  
  const mongoUri = process.env.MONGODB_URL;
  
  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};

module.exports = connectMongoDB;