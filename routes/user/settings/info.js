const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_user_settings_info.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		let {username, description, postSign, color} = body;
		if(!username) ctx.throw(400, '用户名不能为空');
		const {contentLength} = ctx.tools.checkString;
		if(contentLength(username) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
		if(contentLength(description) > 500) ctx.throw(400, '个人简介不能超过250个字。');
		if(contentLength(postSign) > 1000) ctx.throw(400, '帖子签名不能超过500个字。');
		if(color.length > 10) ctx.throw(400, '背景颜色错误');
		username = username.trim();
		color = color.trim();
		const q = {
			description,
			postSign,
			color
		};
		if(user.username !== username) {
			const kcbSettings = await db.SettingModel.findOne({type: 'kcb'});
			if(!kcbSettings) ctx.throw(500, '科创币设置错误：未找到相关设置');
			const {defaultUid, changeUsername} = kcbSettings;
			if(user.kcb < changeUsername) ctx.throw(400, `科创币不足，修改用户名需花费200个科创币`);
			const sameUsernameUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
			if(sameUsernameUser) ctx.throw(400, '用户名已存在');
			const defaultUser = await db.UserModel.findOne({uid: defaultUid});
			if(!defaultUser) ctx.throw(500, '科创币设置错误：未找到默认用户');
			q.username = username;
			q.usernameLowerCase = username.toLowerCase();
			q.$inc = {kcb: -1*changeUsername};
			await defaultUser.update({$inc: {kcb: changeUsername}});
		}
		await user.update(q);
		const userInfo = ctx.cookies.get('userInfo');
		const {lastLogin} = JSON.parse(decodeURI(userInfo));
		const newUser = await db.UserModel.findOnly({uid: user.uid});
		const cookieStr = encodeURI(JSON.stringify({
			uid: newUser.uid,
			username,
			lastLogin
		}));
		ctx.cookies.set('userInfo', cookieStr, {
			signed: true,
			maxAge: ctx.settings.cookie.life,
			httpOnly: true
		});
		data.cookie = ctx.cookies.get('userInfo');
		data.user = newUser;
		await next();
	});
module.exports = infoRouter;