import { MondrianCompiler } from "../src/compiler/index";
import { IMondrianData } from "../src/data-manager/data";
import { readTestData } from "./helpfer";

describe("Data compiler", () => {
  it("works", async () => {
    const data = await readTestData("guest");
    const compiler = new MondrianCompiler();
    const t = performance.now();
    const isOk = compiler.compile(data as IMondrianData[]);
    console.log(111, performance.now() - t);
    const arr = [];
    let itr = compiler.head;
    while (itr) {
      arr.push(itr.action);
      itr = itr.next;
    }
    expect(isOk).toBeTruthy();
  });
});
