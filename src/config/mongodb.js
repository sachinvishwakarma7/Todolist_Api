const { default: mongoose } = require("mongoose");

const url = process.env.MONGODB_URL;

const connectMongoDB = () => {
  mongoose
    .connect(url)
    .then(() => {
      console.log("mongo database connected!");
    })
    .catch((error) => {
      console.log("Erron mongo database connection!", error);
    });
};

module.exports = connectMongoDB;
