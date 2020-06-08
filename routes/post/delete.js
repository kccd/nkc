const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, body, params, data} = ctx;
    // 是文章、回复还是评论
      // 是文章
        // 是否有回复
          // 有回复
            // 发表30分钟以内
              // 是 <delete>
              // 否 <文章在发表后30分钟内，作者都可以自行删除>
          // 没回复 <delete>
      // 是回复
        // 是否被引用或评论
          // 发表10分钟以内
            // 是 <delete>
            // 否
      // 是评论
        // 是否有回评
          // 发表3分钟以内
            // 是 <delete>
            // 否
    data.message = "hhhhhhhhhhhh23333";
    await next();
  });
module.exports = router;