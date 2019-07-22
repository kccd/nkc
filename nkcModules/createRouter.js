/*
* 根据目录名构建router
*
* 目录/文件        介绍           路由                  文件目录
*
* _index.js    主路由文件      /home                   /home/_index.js
* _p_param     带参数目录      /user/:uid/name         /user/_p_uid/name.js
* _p_param.js  带参数的文件    /user/:uid              /user/_p_uid.js
*
* 路由文件允许get、post、del、use和patch
* 例如： module.exports = {
*   get  : async () => {},
*   post : async () => {},
*   patch: async () => {},
*   del  : async () => {},
*   use  : async () => {}
* }
* */

const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const defaultFileName = ["index.js"];
const reg = /^\/_p_(.*?)/;
module.exports = (dirname) => {
  const router = new Router();
  let filenames = fs.readdirSync(dirname);
  filenames = filenames.filter(name => !defaultFileName.includes(name));
  for(const filename of filenames) {
    const filePath = dirname + "/" + filename;
    if(filename === "_index.js") {
      const {get, del, post, patch, use} = require(filePath);
      if(use) router.use("/", use);
      if(get) router.get("/", get);
      if(del) router.del("/", del);
      if(post) router.post("/", post);
      if(patch) router.patch("/", patch);
      continue;
    }
    let url = `/${path.basename(filename, ".js")}`;
    let childRouter;
    if(fs.statSync(filePath).isDirectory()) {
      if(reg.test(url)) {
        const param = url.replace(reg, "");
        url = `/:${param}`;
      }
      const createRouter = require(__dirname + "/createRouter");
      childRouter = createRouter(filePath);
    } else if(path.extname(filename) === ".js") {
      const {get, del, post, patch, use} = require(filePath);
      childRouter = new Router();
      if(use) router.use("/", use);
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