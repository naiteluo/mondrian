const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { ChannelManager, Channel } = require("./channel-manager");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use((req, res, next) => {
  if (!req.path.includes("/cache/")) {
    next();
  } else {
    const mark = req.query.mark;
    if (!ChannelManager.isValidMark(mark)) {
      res.json({
        success: false,
        msg: ChannelManager.MarkErrorMsg,
      });
      return;
    }
    next();
  }
});

app.get("/", (req, res) => {
  res.send("<h1>Mondrian live server is on.</h1>");
});

app.get("/cache/saveCache", async (req, res) => {
  const mark = req.query.mark;
  // do not override file with mark
  // but if mark === temp will be free to override
  if (ChannelManager.isCacheFileExistByMark(mark) && mark !== "temp") {
    res.json({
      success: false,
      msg: `cache file with mark: ${mark} do exists, and can not be overrided.`,
    });
    return;
  }

  try {
    let { ok, error } = await ChannelManager.saveCacheToFile(mark);
    if (ok) {
      res.json({
        success: true,
      });
    } else {
      throw error;
    }
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
});

app.get("/cache/switchCache", async (req, res) => {
  const mark = req.query.mark;
  // do not override file with mark
  // but if mark === temp will be free to override
  // if (!ChannelManager.isCacheFileExistByMark(mark)) {
  //   res.json({
  //     success: false,
  //     msg: `cache file with mark: ${mark} do not exists`,
  //   });
  //   return;
  // }
  try {
    const { ok, data, error } = await ChannelManager.getCacheFromFile(mark);

    if (ok) {
      ChannelManager.cache.splice(0, ChannelManager.cache.length, ...data);
      res.json({
        success: true,
      });
      return;
    } else {
      throw error;
    }
  } catch (error) {
    res.json({
      success: false,
      error,
      msg: "Fails to read and switch cache.",
    });
  }
});

app.get("/getCurrentCache", async (req, res) => {
  const mark = req.query.mark;
  // do not override file with mark
  // but if mark === temp will be free to override
  if (!ChannelManager.isCacheFileExistByMark(mark)) {
    res.json({
      success: false,
      msg: `cache file with mark: ${mark} do not exists`,
    });
    return;
  }
  try {
    const { ok, data, error } = await ChannelManager.getCacheFromFile(mark);

    if (ok) {
      res.json({
        success: true,
        data: {
          cache: data,
        },
      });
      return;
    } else {
      throw error;
    }
  } catch (error) {
    res.json({
      success: false,
      error,
      msg: "Fails to read cache.",
    });
  }
});

app.get("/clearChannel", async (req, res) => {
  const channelName = req.query.mark;
  const channel = await ChannelManager.getChannel(channelName);
  channel.cache = [];
  res.json({ success: true });
});

async function preloadCache() {
  try {
    const { ok, data, error } = await ChannelManager.getCacheFromFile(
      ChannelManager.DefaultMark
    );
    if (ok) {
      ChannelManager.cache.splice(0, ChannelManager.cache.length, ...data);
      console.log("[Cache] init success");
      console.log("[Cache] init size: ", data.length);
    } else {
      throw error;
    }
  } catch (error) {
    console.warn("[Cache] init empty");
    console.log(error);
  }
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const channelPool = {};

io.on("connection", async (socket) => {
  let channelName = socket.handshake.query.channel || "guest";
  let uid = socket.id;
  console.log(
    `[IO] New user(${uid}) connected. Joining channel: ${channelName}`
  );
  const channel = await ChannelManager.getChannel(channelName);
  socket.join(channelName);
  socket.emit("r", channel.cache);
  socket.on("fr", () => {
    channel.cache = [];
  });
  socket.on("d", async (data) => {
    channel.appendData(data);
    socket.broadcast.to(channelName).emit("d", data);
  });
  socket.on("disconnect", async (data) => {
    const sockets = await socket.to(channelName).allSockets();
    if (sockets.size === 0) {
      console.log(`[IO] Channel(${uid}) is free. Destroy and do caching.`);
      ChannelManager.destroyChannel(channelName);
    }
  });
});

server.listen(3000, () => {
  console.log("[App] listening on *:3000");
});
