const Router = require('koa-router');
const disabledRouter = new Router();
disabledRouter
	.put('/', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {applicationForm, user} = data;
		if(!applicationForm.fund.ensureOperatorPermission('admin', user)) ctx.throw(403,'抱歉！您没有权限进行屏蔽操作。');
		const {type} = body;
		applicationForm.disabled = type;
		await applicationForm.save();
		const recycleId = await db.SettingModel.getRecycleId();
    const thread = await db.ThreadModel.findOnly({tid: applicationForm.tid});
    let fids;
    if(type) {
      fids = new Set(thread.mainForumsId);
      fids.add(recycleId);
      await thread.update({mainForumsId: [recycleId]});
      await db.ForumModel.updateForumsMessage([...fids]);
    } else {
      const fundForums = await db.ForumModel.find({kindName: "fund"});
      fids = new Set();
      for(const forum of fundForums) {
        fids.add(forum.fid);
      }
      fids.add(applicationForm.category);
      await thread.update({mainForumsId: [...fids]});
      fids.add(recycleId);
    }
    await db.ForumModel.updateForumsMessage([...fids]);
    const targetUser = await db.UserModel.findOnly({uid: applicationForm.uid});
    await targetUser.updateUserMessage();
		await next();
	});
module.exports = disabledRouter;
