const Router = require('koa-router');
const router = new Router();
router
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		const {newUsername} = body;
		if(user.username === newUsername) {
			ctx.throw(400, '新用户名不能与旧用户名相同');
		}
		const kcbSettings = await db.SettingModel.findOne({type: 'kcb'});
		if(!kcbSettings) ctx.throw(500, '科创币设置错误：未找到相关设置');
		const {defaultUid, changeUsername} = kcbSettings;
		if(user.kcb < changeUsername) ctx.throw(400, `科创币不足，修改用户名需花费200个科创币`);
		const sameUsernameUser = await db.UserModel.findOne({usernameLowerCase: newUsername.toLowerCase()});
		if(sameUsernameUser) ctx.throw(400, '用户名已存在');
		const oldUsername = await db.SecretBehaviorModel.findOne({type: 'changeUsername', oldUsernameLowerCase: newUsername.toLowerCase(), toc: {$gt: Date.now()-365*24*60*60*1000}}).sort({toc: -1});
		if(oldUsername && oldUsername.uid !== user.uid) ctx.throw(400, '用户名曾经被人使用过了，请更换。');
		const defaultUser = await db.UserModel.findOne({uid: defaultUid});
		if(!defaultUser) ctx.throw(500, '科创币设置错误：未找到默认用户');
		const newUsernameLowerCase = newUsername.toLowerCase();

		/*const newSecretBehavior = db.SecretBehaviorModel({
			type: 'changeUsername',
			oldUsername: user.username,
			oldUsernameLowerCase: user.usernameLowerCase,
			newUsername: username,
			newUsernameLowerCase: username.toLowerCase(),
			uid: user.uid,
			ip: ctx.address,
			port: ctx.port
		});
		await generateUsersBehavior({
			uid: user.uid,
			toUid: user.uid,
			operation: 'changeUsername',
			oldUsername: user.username
		});
		await newSecretBehavior.save();
		*/

		await defaultUser.update({$inc: {kcb: changeUsername}});
		user.username = newUsername;
		user.usernameLowerCase = newUsernameLowerCase;
		user.kcb -= changeUsername;
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