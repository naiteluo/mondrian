import fs from "fs";
import readline from "readline";
import path from "path";
export const readTestData = async (tag: string): Promise<unknown[]> => {
  const filePath = path.join(
    __dirname,
    `../../mondrian-server/cache/data_${tag}.log`
  );
  if (fs.existsSync(filePath)) {
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
          resolve(tmpList);
        });
        rl.on("close", () => {
          rs.close();
        });
      } catch (error) {
        reject([]);
      }
    });
  } else {
    console.error(`file do not exsist, filePath: ${filePath}`);
    return [];
  }
};
