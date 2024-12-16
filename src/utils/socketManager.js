const {
  sendMessageConnection,
  deleteMessageConnection,
  updateMessageReadStatusConnection,
  editMessageContentConnection,
} = require("../controllers/messageController");

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    // Handle socket events
    socket.on("joinRoom", (room) => {
      console.log(`${socket.id} joined room ${room}`);
      socket.join(room);
    });

    socket.on("sendMessage", ({ senderId, recipientId, message }) => {
      sendMessageConnection(io, socket, { senderId, recipientId, message });
    });

    socket.on("deleteMessage", async (messageId) => {
      deleteMessageConnection(io, socket, messageId);
    });

    socket.on("markAsRead", ({ messageId, recipientId }) => {
      updateMessageReadStatusConnection(io, socket, { messageId, recipientId });
    });

    socket.on("editMessage", async ({ messageId, userId, newMessage }) => {
      editMessageContentConnection(io, socket, {
        messageId,
        userId,
        newMessage,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = { setupSocket };
