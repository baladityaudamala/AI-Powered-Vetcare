const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
console.log("DEBUG: MAIL_USER is", process.env.MAIL_USER ? "LOADED" : "MISSING");
console.log("DEBUG: MAIL_PASS is", process.env.MAIL_PASS ? "LOADED" : "MISSING");

// ── Database: Sequelize MySQL (replaces mongoConnection) ─────────────────────
const { sequelize, Chat, ChatMessage, ChatParticipant, ChatUnreadCount, User } = require("./models/index");

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL,
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"]),
].filter(Boolean);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({ origin: allowedOrigins }));
app.use(morgan("dev"));

// Routes
app.use("/users",   require("./routes/userRoutes"));       // Register + login + CRUD
app.use("/confirm", require("./routes/confirmRoutes"));    // Email verification
app.use("/api",     require("./routes/petRoutes"));        // Pets and related data
app.use("/api",     require("./routes/imgLocRoutes"));     // Local image upload
app.use("/images",  express.static(path.join(__dirname, "client/public/images")));
app.use("/api",     require("./routes/pushRoutes"));       // Push subscriptions
app.use("/posts",   require("./routes/postRoutes"));       // Community Feed
app.use("/chats",   require("./routes/chatRoutes"));       // Chat

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Backend is running!");
  });
}

// Socket.io setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: allowedOrigins }
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    console.log("Message received:", data);
    const { roomId, senderId, text } = data;

    try {
      const chat = await Chat.findByPk(roomId);

      if (chat) {
        // Save new message
        const newMessage = await ChatMessage.create({
          chatId: roomId,
          senderId,
          text,
        });

        // Update last message on chat
        await chat.update({ lastMessage: text, lastMessageDate: new Date() });

        // Get participants from join table and handle unread counts
        const participants = await ChatParticipant.findAll({ where: { chatId: roomId } });

        for (const cp of participants) {
          if (String(cp.userId) !== String(senderId)) {
            // Increment unread count for other participants
            const existing = await ChatUnreadCount.findOne({
              where: { chatId: roomId, userId: String(cp.userId) },
            });
            if (existing) {
              await existing.update({ count: existing.count + 1 });
            } else {
              await ChatUnreadCount.create({ chatId: roomId, userId: String(cp.userId), count: 1 });
            }

            // Emit notification to their personal room
            io.to(String(cp.userId)).emit("notification", {
              chatId: roomId,
              senderId,
              text,
            });
          }
        }

        // Broadcast to chat room
        io.to(String(roomId)).emit("receive_message", {
          id: newMessage.id,
          _id: newMessage.id,
          chatId: roomId,
          senderId,
          text,
          createdAt: newMessage.createdAt,
        });
      }
    } catch (err) {
      console.error("Socket Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// ── Connect to MySQL and start server ────────────────────────────────────────
sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL connection established.");
    // sync({ alter: true }) updates existing tables without dropping data
    // Use sync({ force: true }) ONLY the first time to create all tables fresh
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("All MySQL tables synced.");

    // Start Scheduler (after DB is ready)
    const { startScheduler } = require("./cron/scheduler");
    startScheduler();

    server.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MySQL connection error:", err);
    process.exit(1);
  });
