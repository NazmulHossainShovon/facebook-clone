import { Server, Socket } from "socket.io";

export function registerChatHandlers(io: Server, socket: Socket) {
  // Listen for join room
  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
  });

  // Listen for sending a message
  socket.on(
    "chatMessage",
    (data: { roomId: string; message: string; sender: string }) => {
      io.to(data.roomId).emit("chatMessage", {
        message: data.message,
        sender: data.sender,
        timestamp: new Date().toISOString(),
      });
    }
  );

  // Handle disconnect
  socket.on("disconnect", () => {
    // Optionally handle user disconnect logic
  });
}
