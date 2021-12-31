// const fs = require("fs");
// const path = require("path");

// const thePath =
//   "/Users/mob/Code/workspace/modrian/cypress/screenshots/initial-app.spec.js/initialize mondrian app -- should react to pointer event and drawline.png";

// console.log(path.parse(thePath));

//  // do image diff
//  const img1 = PNG.sync.read(fs.readFileSync(basePath));
//  const img2 = PNG.sync.read(fs.readFileSync(currentPath));
//  const { width, height } = img1;
//  const diff = new PNG({ width, height });
//  const diffCount = pixelmatch(
//    img2.data,
//    img1.data,
//    diff.data,
//    width,
//    height,
//    {
//      threshold: 0.1,
//      diffMask: false,
//    }
//  );
//  fs.writeFileSync(diffPath, PNG.sync.write(diff));
//  const diffPercentage = diffCount / (width * height);