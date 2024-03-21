// index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send(
    "<h1>Chào mừng đến với ứng dụng của tôi!</h1><p>Đây là một đoạn văn.</p>"
  );
});
server.listen(3000, () => {
  console.log("listening on *:3000");
});
