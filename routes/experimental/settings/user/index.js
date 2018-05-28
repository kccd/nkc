const Router = require('koa-router');
const userRouter = new Router();
userRouter
	.use('/', async (ctx, next) => {
		ctx.template = 'experimental/settings/user.pug';
		ctx.data.type = 'user';
		await next();
	})
	.get('/', async (ctx, next) => {
		const {query, data, db} = ctx;
		let {page, searchType, content} = query;
		if(['username', 'uid'].includes(searchType)) {
			content = content.trim();
			let targetUser;
			if(searchType === 'username') {
				targetUser = await db.UserModel.findOne({usernameLowerCase: content.toLowerCase()});
			} else {
				targetUser = await db.UserModel.findOne({uid: content});
			}
			if(targetUser) {
				await targetUser.extend();
			}
		} else {
			if(page) {
				page = parseInt(page);
			} else {
				page = 0;
			}
			const {apiFunction} = ctx.nkcModules;
			const count = await db.UserModel.count();
			const paging = apiFunction.paging(page, count);
			data.paging = paging;
			const users = await db.UserModel.find({}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
			data.users = await Promise.all(users.map(async user => {
				await user.extend();
				return user;
			}));
		}
		await next();
	})
	.get('/:uid', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		await targetUser.extend();
		await targetUser.extendRoles();
		data.targetUser = targetUser;
		let rolesId = targetUser.roles.map(r => r._id);
		rolesId = rolesId.concat(['default', 'banned', 'visitor']);
		data.roles = await db.RoleModel.find({_id: {$nin: rolesId}}).sort({toc: 1});
		await next();
	})
	.patch('/:uid', async (ctx, next) => {
		const {params, db, body} = ctx;
		const {operation} = body;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		if(operation === 'addRole') {
			// 添加角色
			const {roleDisplayName} = body;
			const role = await db.RoleModel.findOnly({displayName: roleDisplayName});
			await targetUser.update({$addToSet: {certs: role._id}});
		} else if(operation === 'removeRole') {
			// 移除角色
			const {roleDisplayName} = body;
			const role = await db.RoleModel.findOnly({displayName: roleDisplayName});
			await targetUser.update({$pull: {certs: role._id}});

		} else {

			//普通信息修改
			let {username, description, mobile, nationCode, email} = body;

			username = username.trim();

			if (!username) ctx.throw(400, '用户名不能为空');

			const {checkEmailFormat} = ctx.tools.checkString;

			const q = {description};

			const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});

			// 检测邮箱
			if (email) {
				if (checkEmailFormat(email) === -1) {
					ctx.throw(400, '邮箱格式不正确');
				}
				q.email = email;
			}

			// 检测手机号码
			if (mobile && nationCode) {
				const sameMobileUser = await db.UsersPersonalModel.findOne({nationCode, mobile});
				if (sameMobileUser && sameMobileUser.uid !== targetUser.uid) {
					ctx.throw(400, '电话号码已被其他用户绑定');
				} else {
					q.mobile = mobile;
					q.nationCode = nationCode;
				}
			}

			if (username !== targetUser.username) {
				//修改用户名流程
				const sameUsernameUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
				if (sameUsernameUser) ctx.throw(400, '用户名已存在');
				const oldUsername = await db.SecretBehaviorModel.findOne({
					type: 'changeUsername',
					oldUsernameLowerCase: username.toLowerCase(),
					toc: {$gt: Date.now() - 365 * 24 * 60 * 60 * 1000}
				}).sort({toc: -1});
				if (oldUsername && oldUsername.uid !== targetUser.uid) ctx.throw(400, '用户名曾经被人使用过了，请更换。');
				const newSecretBehavior = db.SecretBehaviorModel({
					type: 'changeUsername',
					oldUsername: targetUser.username,
					oldUsernameLowerCase: targetUser.usernameLowerCase,
					newUsername: username,
					newUsernameLowerCase: username.toLowerCase(),
					uid: targetUser.uid,
					ip: ctx.address,
					port: ctx.port
				});
				await newSecretBehavior.save();
				q.username = username;
				q.usernameLowerCase = username.toLowerCase();
			}
			await targetUser.update(q);
			await targetUserPersonal.update(q);
			if(q.nationCode && q.mobile) {
				await targetUser.update({$addToSet: {certs: 'mobile'}});
			} else {
				await targetUser.update({$pull: {certs: 'mobile'}});
			}
			if(q.email) {
				await targetUser.update({$addToSet: {certs: 'email'}});
			} else {
				await targetUser.update({$pull: {certs: 'email'}});
			}
		}
		await next();
	});
module.exports = userRouter;