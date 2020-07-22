const Router = require('koa-router');
const router = new Router();
router
	.put('/', async (ctx, next) => {
		const {data, db, body, nkcModules} = ctx;
		const {user} = data;
		const {newUsername} = body;
		const behavior = {
      oldUsername: user.username,
      oldUsernameLowerCase: user.usernameLowerCase,
      uid: user.uid,
      type: "modifyUsername",
      ip: ctx.address,
      port: ctx.port
    };
		// 验证用户名字符串
    await db.UserModel.checkUsername(newUsername);
    // 验证用户的kcb
    // const needKcb = await db.UserModel.checkModifyUsername(user.uid);
    // 验证用户的积分
    const {needScore, scoreObject} = await db.UserModel.checkModifyUsernameScore(user.uid);
		if(user.username === newUsername) {
			ctx.throw(400, '新用户名不能与旧用户名相同');
		}
		const usernameLowerCase = newUsername.toLowerCase();
		const sameUsernameUser = await db.UserModel.findOne({uid: {$ne: user.uid}, usernameLowerCase: usernameLowerCase});
		if(sameUsernameUser) ctx.throw(400, '用户名已存在');
		const sameNameColumn = await db.ColumnModel.findOne({uid: {$ne: user.uid}, nameLowerCase: usernameLowerCase});
		if(sameNameColumn) ctx.throw(400, "用户名已存在");
		const oldUsername = await db.SecretBehaviorModel.findOne({type: {$in: ['modifyUsername', "destroy"]}, oldUsernameLowerCase: usernameLowerCase, toc: {$gt: Date.now()-365*24*60*60*1000}}).sort({toc: -1});
		if(oldUsername && oldUsername.uid !== user.uid) ctx.throw(400, '用户名曾经被人使用过了，请更换。');

		if(needScore && needScore > 0) {
		  await db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID("kcbsRecords", 1),
        type: "modifyUsername",
        from: user.uid,
        to: "bank",
        num: needScore,
        ip: ctx.address,
        port: ctx.port,
        scoreType: scoreObject.type
      }).save();
    }

		user.username = newUsername;
		user.usernameLowerCase = usernameLowerCase;
    behavior.newUsername = user.username;
    behavior.newUsernameLowerCase = user.usernameLowerCase;
		await user.save();
		await db.SecretBehaviorModel(behavior).save();
    await db.UsersGeneralModel.updateOne({uid: user.uid}, {
      $inc: {
        modifyUsernameCount: 1
      }
    });
		// 同步到elasticSearch搜索数据库
    await nkcModules.elasticSearch.save("user", user);

    const _usersPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});

    ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
      lastLogin: _usersPersonal.secret
    });
		await next();
	});
module.exports = router;
