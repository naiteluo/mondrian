import { MondrianCompiler } from "../src/compiler/index";
import { readTestData } from "./helpfer";

describe("Data compiler", () => {
  it("works", async () => {
    const data = await readTestData("jest-compiler");
    const compiler = new MondrianCompiler();
    // const result = compiler.compile(data);
    // expect(compiler.compile()).toBeTruthy();
  });
});
