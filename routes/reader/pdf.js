const router = require("koa-router")();
router
  .get("/web/viewer", async (ctx, next) => {
    const {nkcModules, db, query, data} = ctx;
    let {file} = query;
    file = file.replace(/^\/r\/([0-9]+)/i, "$1");
    const resource = await db.ResourceModel.findOnly({rid: file});
    const {ext} = resource;
    if(ext !== "pdf") ctx.throw(400, "仅支持预览pdf文件");
    const downloadOptions = await db.SettingModel.getDownloadSettingsByUser(data.user);
    const {fileCountOneDay} = downloadOptions;
    if(fileCountOneDay === 0) {
      if(!data.user) {
        ctx.throw(403, '只有登录用户可以预览文件，请先登录或者注册。');
      } else {
        ctx.throw(403, '您当前账号等级无法预览文件，请发表优质内容提升等级。');
      }
    }
    let downloadToday;
    const match = {
      toc: {
        $gte: nkcModules.apiFunction.today()
      }
    };
    if(!data.user) {
      // 游客
      match.ip = ctx.address;
      match.uid = "";
    } else {
      // 已登录用户
      match.uid = data.user.uid;
    }
    const logs = await db.DownloadLogModel.aggregate([
      {
        $match: match
      },
      {
        $group: {
          _id: "$rid",
          count: {
            $sum: 1
          }
        }
      }
    ]);
    downloadToday = logs?logs.map(l => l._id): [];
    if(!downloadToday.includes(resource.rid) && downloadToday.length >= fileCountOneDay) {
      if(data.user) {
        ctx.throw(403, "今日预览的文件数量已达上限，请明天再试。");
      } else {
        ctx.throw(403, `未登录用户每天只能预览${fileCountOneDay}个文件，请登录或注册后重试。`);
      }
    }
    ctx.template = "reader/pdf/web/viewer.pug";
    await next();
  });
module.exports = router;