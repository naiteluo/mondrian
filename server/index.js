const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const cache = [];
const CacheMaxLength = 50000;

function saveToCache(data) {
  cache.push(...data);
  if (cache.length > CacheMaxLength) {
    cache.splice(0, cache.length - CacheMaxLength);
  }
}

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("a new user connected, recover data");
  socket.emit("d", cache);
  socket.on("d", (data) => {
    saveToCache(data);
    socket.broadcast.emit("d", data);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
