const router = require("koa-router")();
router
  // 附件详情
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {resource} = data;
    // 附件对象
    // 文件下载限制信息
    data.fileCountLimitInfo = await db.SettingModel.getDownloadFileCountLimitInfoByUser(user);
    // 租期时长
    const {freeTime} = await db.SettingModel.getSettings('download');
    data.freeTime = freeTime;
    // 是否免费
    const {needScore, reason, description} = await resource.checkDownloadCost(user);
    if(reason !== 'repeat') {
      await resource.checkDownloadPermission(user, ctx.address);
    }
    data.needScore = needScore;
    data.freeReason = reason;
    data.description = description;
    if(data.needScore && user) {
      const {enough, userScores} = await resource.checkUserScore(user);
      data.userScores = userScores;
      data.enough = enough;
    }
    await resource.setFileExist();
    data.resource = resource.toObject();
    const downloadSettings = await db.SettingModel.getSettings('download');
    data.downloadWarning = downloadSettings.warning;
    data.uploader = await db.UserModel.findOnly({uid: resource.uid}, {
      uid: 1,
      username: 1,
      avatar: 1,
    });
    return next();
  })
module.exports = router;
