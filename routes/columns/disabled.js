const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {data, body, nkcModules} = ctx;
    const {type, index} = body;
    const {column} = data;
    console.log(body)
    let obj = {};
    if(type === "disabledColumn") {
      obj.disabled = true;
    } else if(type === "unDisabledColumn") {
      obj.disabled = false;
    } else if(type === "name") {
      obj.name = "";
      obj.nameLowerCase = "";
    } else if(type === "abbr") {
      obj.abbr = "";
    } else if(type === "logo") {
      await nkcModules.file.deleteColumnAvatar(column._id);
    } else if(type === "banner") {
      await nkcModules.file.deleteColumnBanner(column._id);
    } else if(type === "disabledNotice") {
      obj.noticeDisabled = true;
    } else if(type === "unDisabledNotice") {
      obj.noticeDisabled = false;
    } else if(type === "disabledBlocks") {
      obj.blocksDisabled = true;
    } else if(type === "unDisabledBlocks") {
      obj.blocksDisabled = false;
    } else if(type === "unDisabledOtherLinks") {
      obj.otherLinksDisabled = false;
    } else if(type === "disabledOtherLinks"){
      obj.otherLinksDisabled = true;
    }
    await column.update(obj);
    await next();
  });
module.exports = router;
