const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const defaultFileName = ["index.js"];
module.exports = (dirname) => {
  const router = new Router();
  let filenames = fs.readdirSync(dirname);
  filenames = filenames.filter(name => !defaultFileName.includes(name));
  for(const filename of filenames) {
    const filePath = dirname + "/" + filename;
    if(filename === "home.js") {
      const {get, del, post, patch} = require(filePath);
      if(get) router.get("/", get);
      if(del) router.del("/", del);
      if(post) router.post("/", post);
      if(patch) router.patch("/", patch);
    }
    const url = `/${path.basename(filename, ".js")}`;
    let childRouter;
    if(fs.statSync(filePath).isDirectory()) {
      const createRouter = require(__dirname + "/createRouter");
      childRouter = createRouter(filePath);
    } else if(path.extname(filename) === ".js") {
      const {get, del, post, patch} = require(filePath);
      childRouter = new Router();
      if(get) childRouter.get("/", get);
      if(del) childRouter.del("/", del);
      if(post) childRouter.post("/", post);
      if(patch) childRouter.patch("/", patch);
    } else {
      continue;
    }
    router.use(url, childRouter.routes(), childRouter.allowedMethods());
  }
  return router;
};