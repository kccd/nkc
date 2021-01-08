const router = require("koa-router")();
router
  // 附件详情
  .get("/", async (ctx, next) => {
    const {data, db, params} = ctx;
    const {user} = data;
    if(!user) ctx.throw(403, "尚未登录不能查看附件详情");
    const detail = {};
    data.detail = detail;
    // 附件对象
    const {rid} = params;
    const resource = await db.ResourceModel.findOne({rid, type: "resource"});
    // 附件所需积分信息和用户持有积分信息
    const {enough, userScores} = await resource.checkUserScore(user);
    detail.costScores = userScores;
    // 文件下载限制信息
    const fileCountLimitInfo = await db.SettingModel.getDownloadFileCountLimitInfoByUser(user);
    detail.fileCountLimitInfo = fileCountLimitInfo;
    // 积分是否足够
    detail.enough = enough;
    // 租期时长
    const leaseDuration = 24 * 60 * 60 * 1000;
    detail.leaseDuration = leaseDuration;
    // 是否免费
    let {needScore, reason} = await resource.checkDownloadCost(user, leaseDuration);
    detail.free = !needScore && reason === "setting";
    // 此用户是否在租期内(支付过，没到期)
    detail.paid = !needScore && reason === "repeat";

    await resource.setFileExist();
    detail.resource = resource.toObject();
    return next();
  })
module.exports = router;