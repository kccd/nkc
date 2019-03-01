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
		let {page = 0, searchType, content, t} = query;
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
			data.targetUser = targetUser;
		} else {
      const q = {};
      if(t) {
        const role = await db.RoleModel.findOne({_id: t});
        if(role) {
          if(role._id === 'scholar') {
            q.xsf = {$gt: 0};
          } else if(role._id === 'default') {

          } else {
            q.certs = role._id;
          }
          data.t = t;
          data.role = role;
        }
      }
			const {apiFunction} = ctx.nkcModules;
      const count = await db.UserModel.count(q);
      console.log(count, q)
			const paging = apiFunction.paging(page, count);
			data.paging = paging;
			const users = await db.UserModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
			data.users = await Promise.all(users.map(async user => {
				await user.extend();
				return user;
			}));
    }
    data.roles = await db.RoleModel.find();
		await next();
	})
	.get('/:uid', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		await targetUser.extend();
		await targetUser.extendRoles();
		data.targetUser = targetUser;
		data.roles = await db.RoleModel.find({type: {$in: ['common', 'management']}}).sort({toc: 1});
		await next();
	})
	.patch('/:uid', async (ctx, next) => {
		const {params, db, body} = ctx;
		const {operation} = body;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		if(['addRole', 'removeRole'].includes(operation)) {
			const {roleDisplayName} = body;
			const role = await db.RoleModel.findOnly({displayName: roleDisplayName});
			if(role._id === 'dev') ctx.throw(400, '运维人员不可编辑！！！');
			if(role._id === 'scholar') ctx.throw(400, '无需给用户添加学者角色，若用户的学术分大于0系统会自动为用户添加学者角色');
			if(['banned', 'visitor'].includes(role._id)) ctx.throw(400, '数据错误，请刷新');
			if(role._id === 'moderator') ctx.throw(400, '暂不支持专家角色的添加与移除');
			if(operation === 'addRole') {
				await targetUser.update({$addToSet: {certs: role._id}});
			} else {
				await targetUser.update({$pull: {certs: role._id}});
			}
		} else {

			//普通信息修改
			let {username, description, mobile, nationCode, email} = body;

			username = username.trim();

			if (!username) ctx.throw(400, '用户名不能为空');
			const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");

			if(pattern.test(username)) ctx.throw(400, '用户名含有非法字符！');

			const {checkEmailFormat} = ctx.tools.checkString;

			const q = {description};

			const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});

			// 检测邮箱
			if (email) {
				if (checkEmailFormat(email) === -1) {
					ctx.throw(400, '邮箱格式不正确');
				}
				const u = await db.UsersPersonalModel.findOne({uid: {$ne: targetUser.uid}, email});
				if(u) ctx.throw(400, '邮箱已被注册');
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

				q.username = username;
				q.usernameLowerCase = username.toLowerCase();
			}
			await targetUser.update(q);
			await targetUserPersonal.update(q);
		}
		await next();
	});
module.exports = userRouter;