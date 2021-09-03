const router = require('koa-router')();
router
  .put('/', async (ctx, next) => {
    const {data, body, db} = ctx;
    const {number} = body;
    if(number === undefined) {
      ctx.throw(400, '参数错误。');
    }
    const {user, applicationForm} = data;
    //判断操作者身份，只有申请人才有权限确认收款
    if(user.uid !== applicationForm.uid) {
      ctx.throw(400, '您不是申请人，无权完成该操作。');
    }
    //判断第几期拨款需要确认，与用户上传的参数比对
    const {remittance} = applicationForm;
    let num;
    for(let i = 0; i < remittance.length; i++) {
      const r = remittance[i];
      if(r.status === true && !r.verify) {
        num = i;
        break;
      }
    }
    if(number !== num) ctx.throw(400, '参数错误。');
    const r = remittance[number];
    r.verify = true;
    const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
    const newReport = db.FundDocumentModel({
      _id: newId,
      uid: user.uid,
      type: 'system',
      applicationFormId: applicationForm._id,
      support: true,
      c: `第 ${number + 1} 期申请人确认收款`
    });
    await newReport.save();
    await applicationForm.updateOne({remittance});
    await next();
  });
module.exports = router;