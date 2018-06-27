const Router = require('koa-router');
const router = new Router();
router
	.patch('/', async (ctx, next) => {
		const {data, db, body, nkcModules} = ctx;
		const {user} = data;
		const {newUsername} = body;
		const reg = /\s/;
		if(reg.test(newUsername)) ctx.throw(400, '用户名不允许有空格');
		const {contentLength} = ctx.tools.checkString;
		if(contentLength(newUsername) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
		if(user.username === newUsername) {
			ctx.throw(400, '新用户名不能与旧用户名相同');
		}
		const kcbSettings = await db.SettingModel.findOne({type: 'kcb'});
		if(!kcbSettings) ctx.throw(500, '科创币设置错误：未找到相关设置');
		const {defaultUid} = kcbSettings;
		const sameUsernameUser = await db.UserModel.findOne({usernameLowerCase: newUsername.toLowerCase()});
		if(sameUsernameUser) ctx.throw(400, '用户名已存在');
		const oldUsername = await db.SecretBehaviorModel.findOne({operationId: 'modifyUsername', oldUsernameLowerCase: newUsername.toLowerCase(), toc: {$gt: Date.now()-365*24*60*60*1000}}).sort({toc: -1});
		if(oldUsername && oldUsername.uid !== user.uid) ctx.throw(400, '用户名曾经被人使用过了，请更换。');
		const operation = await db.TypesOfScoreChangeModel.findOnly({_id: 'modifyUsername'});
		const modifyUsernameCount = await db.UsersScoreLogModel.count({
			uid: user.uid,
			operationId: 'modifyUsername',
			type: 'kcb',
			toc: {$gt: nkcModules.apiFunction.today()}
		});
		if(operation.count !== 0) {
			if(operation.count !== -1 && operation.count <= modifyUsernameCount) {
				ctx.throw(400, `每天仅有${operation.count}次机会修改用户名，请明天再试`);
			}
			if(user.kcb + operation.change < 0) ctx.throw(400, `科创币不足，修改用户名需花费${operation.change}个科创币`);
			const defaultUser = await db.UserModel.findOne({uid: defaultUid});
			if(!defaultUser) ctx.throw(500, '科创币设置错误：未找到默认账户');
			// 生成科创币交易记录
			await db.UsersScoreLogModel.insertLog({
				user: user,
				type: 'kcb',
				typeIdOfScoreChange: 'modifyUsername',
				ip: ctx.address,
				port: ctx.port
			});

		}
		const newUsernameLowerCase = newUsername.toLowerCase();

		user.username = newUsername;
		user.usernameLowerCase = newUsernameLowerCase;

		await user.save();

		const userInfo = ctx.cookies.get('userInfo');
		const {lastLogin} = JSON.parse(decodeURI(userInfo));
		const cookieStr = encodeURI(JSON.stringify({
			uid: user.uid,
			username: user.username,
			lastLogin
		}));
		ctx.cookies.set('userInfo', cookieStr, {
			signed: true,
			maxAge: ctx.settings.cookie.life,
			httpOnly: true
		});
		data.cookie = ctx.cookies.get('userInfo');
		await next();
	});
module.exports = router;