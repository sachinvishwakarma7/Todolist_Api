const Message = require("../models/Message");

// Handle real-time message delivery
const sendMessageConnection = (io, socket, messageData) => {
  const { senderId, recipientId, message } = messageData;
  const newMessage = new Message({ senderId, recipientId, message });

  newMessage
    .save()
    .then((savedMessage) => {
      io.to(senderId).emit("sendMessage", savedMessage);
      io.to(recipientId).emit("sendMessage", savedMessage);
      socket.broadcast.emit("sendMessage", savedMessage);
      socket.emit("sendMessage", savedMessage);
    })
    .catch((err) => {
      socket.emit("error", { message: "Failed to send message", error: err });
    });
};

const deleteMessageConnection = (io, socket, messageId) => {
  // Validate message ID
  if (!messageId) {
    return socket.emit("error", { message: "Message ID is required." });
  }

  // Find and delete the message
  Message.findByIdAndDelete(messageId)
    .then((deletedMessage) => {
      if (!deletedMessage) {
        return socket.emit("error", { message: "Message not found." });
      }
      const { senderId, recipientId } = deletedMessage;

      // Notify both sender and recipient about the deleted message
      io.to(senderId).emit("deleteMessage", { messageId });
      io.to(recipientId).emit("deleteMessage", { messageId });
      socket.broadcast.emit("deleteMessage", deletedMessage);
      socket.emit("deleteMessage", deletedMessage);
    })
    .catch((err) => {
      socket.emit("error", { message: "Failed to delete message", error: err });
    });
};

const updateMessageReadStatusConnection = (io, socket, messageData) => {
  const { messageId, recipientId } = messageData;

  Message.updateOne({ _id: messageId, recipientId }, { isRead: true })
    .then((result) => {
      if (result.modifiedCount > 0) {
        console.log(
          `Message ${messageId} marked as read for recipient ${recipientId}`
        );
        // Notify the recipient and all other connected clients about the update
        io.to(recipientId).emit("markAsRead", { messageId, isRead: true });
        socket.broadcast.emit("markAsRead", { messageId, isRead: true });
      } else {
        console.log(
          `No message updated for ID ${messageId} and recipient ${recipientId}`
        );
      }
    })
    .catch((error) => {
      console.error("Error updating message read status:", error);
    });
};

const editMessageContentConnection = (io, socket, messageData) => {
  const { messageId, userId, newMessage } = messageData;

  Message.updateOne(
    { _id: messageId, senderId: userId },
    { message: newMessage }
  )
    .then((result) => {
      if (result.modifiedCount > 0) {
        // Notify all connected clients about the update
        io.emit("editMessage", { messageId, newMessage });
      } else {
        console.log(
          `No message updated for ID ${messageId} and sender ${userId}`
        );
      }
    })
    .catch((error) => {
      console.error("Error updating message content:", error);
    });
};

const getMessages = async (req, res) => {
  const { senderId, recipientId } = req.query;

  // Check for required query parameters
  if (!senderId || !recipientId) {
    return res.status(400).json({
      success: false,
      message: "Both senderId and recipientId are required.",
    });
  }

  try {
    // Fetch messages between the sender and recipient
    const messages = await Message.find({
      $or: [
        { senderId: senderId, recipientId: recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by their creation time (ascending)

    // Return success response with messages
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching messages.",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  const { senderId, recipientId, message } = req.body;

  if (!senderId || !recipientId || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields (senderId, recipientId, message) are required.",
    });
  }

  try {
    const newMessage = new Message({ senderId, recipientId, message });

    const savedMessage = await newMessage.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: savedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending the message.",
      error: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  if (!messageId) {
    return res.status(400).json({
      success: false,
      message: "Message ID is required.",
    });
  }

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    // Emit the delete event to relevant users
    const { senderId, recipientId } = deletedMessage;
    req.io.to(senderId).emit("deleteMessage", { messageId });
    req.io.to(recipientId).emit("deleteMessage", { messageId });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
      data: deletedMessage,
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the message.",
      error: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  sendMessageConnection,
  deleteMessageConnection,
  deleteMessage,
  updateMessageReadStatusConnection,
  editMessageContentConnection,
};
