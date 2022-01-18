const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CacheMaxLength = 100000;

class Channel {
  name = "";
  cache = [];
  constructor(name) {
    if (!name || name.length === 0) {
      throw new Error("Invalid channel name.");
    }
    this.name = name;
  }

  async initialize() {
    const data = await this.getCacheFromFile();
    this.cache = [...data];
  }

  /**
   * discard head when oversize
   * @param {*} args
   */
  appendData(args) {
    this.cache.push(...args);
    if (this.cache.length > CacheMaxLength) {
      this.cache.splice(0, this.cache.length - CacheMaxLength);
    }
  }

  destroy() {
    this.saveCacheToFile();
    this.cache = [];
  }

  getCacheFilePath() {
    return ChannelManager.getCacheFilePath(this.name);
  }

  async saveCacheToFile() {
    return await ChannelManager.saveCacheToFile(this.name, this.cache);
  }

  async getCacheFromFile() {
    try {
      const { ok, data, error } = await ChannelManager.getCacheFromFile(
        this.name
      );
      if (ok) {
        return data;
      } else {
        throw error;
      }
    } catch (error) {
      return [];
    }
  }
}

class ChannelManager {
  static channels = new Map();

  static async getChannel(channelName) {
    let channel = ChannelManager.channels.get(channelName);
    if (!channel) {
      channel = new Channel(channelName);
      await channel.initialize();
      ChannelManager.channels.set(channelName, channel);
    }
    return channel;
  }

  static destroyChannel(channelName) {
    let channel = ChannelManager.channels.get(channelName);
    if (channel) {
      channel.destroy();
      ChannelManager.channels.delete(channelName);
    }
  }

  /**
   * discard head when oversize
   * @param {*} args
   */
  static append(args) {
    this.cache.push(...args);
    if (this.cache.length > CacheMaxLength) {
      this.cache.splice(0, this.cache.length - CacheMaxLength);
    }
  }

  static get cache() {
    return cache;
  }

  static getCacheFilePath(mark) {
    return path.join(__dirname, `../cache/data_${mark}.log`);
  }

  /**
   * get cache line by line
   */
  static async getCacheFromFile(mark) {
    const filePath = this.getCacheFilePath(mark);
    const hasFile = ChannelManager.isCacheFileExistByMark(mark);
    if (!hasFile) return [];
    return new Promise((resolve, reject) => {
      try {
        const rs = fs.createReadStream(filePath);
        const rl = readline.createInterface({
          input: rs,
          terminal: false,
        });
        rl.on("error", (error) => {
          reject({ ok: false, error });
        });
        const tmpList = [];
        rl.on("line", (line) => {
          // todo handle parse error
          tmpList.push(JSON.parse(line));
        });
        rl.on("pause", () => {
          rl.close();
          resolve({ ok: true, data: tmpList });
        });
        rl.on("close", () => {
          rs.close();
        });
      } catch (error) {
        reject({ ok: false, error });
      }
    });
  }

  static async saveCacheToFile(mark, datas) {
    return new Promise((resolve, reject) => {
      const filePath = this.getCacheFilePath(mark);
      try {
        const ws = fs.createWriteStream(filePath, {
          flags: "w+",
        });
        datas.forEach((c) => {
          ws.write(JSON.stringify(c) + "\n");
        });
        ws.close(resolve({ ok: true }));
      } catch (error) {
        reject({ ok: false, error });
      }
    });
  }

  static isCacheFileExistByMark(mark) {
    const filePath = this.getCacheFilePath(mark);
    try {
      if (fs.existsSync(filePath)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  static isValidMark(mark) {
    return mark && mark.length > 3;
  }

  static MarkMinLength = 3;

  static MarkErrorMsg = `cache file's mark'length should be at least ${this.MarkMinLength}`;

  static DefaultMark = "temp";
}

module.exports = {
  ChannelManager,
  Channel,
};
