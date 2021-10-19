const Router = require('koa-router');
const userRouter = new Router();
userRouter
	.use('/', async (ctx, next) => {
		ctx.template = 'experimental/settings/user.pug';
		ctx.data.type = 'user';
		await next();
	})
  .get('/', async (ctx, next) => {
    const {query, data, db, nkcModules} = ctx;
    const {page = 0, t = 'default', c = '', uid} = query;
    let users = [], paging = {};
    let [searchType = '', searchContent = ''] = c.split(',');
    const match = {};
    if(t !== 'default') {
      if(t === 'scholar') {
        match.xsf = {$gt: 1};
      } else {
        match.certs = t;
      }
    }
    if(searchType === 'uid') {
      const targetUser = await db.UserModel.findOne({uid: searchContent.trim()});
      match.uid = targetUser? targetUser.uid: '';
    } else if(searchType === 'username') {
      const targetUser = await db.UserModel.findOne({usernameLowerCase: searchContent.toLowerCase()});
      match.uid = targetUser? targetUser.uid: '';
    } else if(searchType === 'ip') {
      const usersPersonal = await db.UsersPersonalModel.find({regIP: searchContent.trim()}, {uid: 1});
      match.uid = {$in: usersPersonal.map(u => u.uid)};
    } else if(searchType === 'mobile') {
      const usersPersonal = await db.UsersPersonalModel.find({mobile: searchContent.trim()}, {uid: 1});
      match.uid = {$in: usersPersonal.map(u => u.uid)};
    } else if(searchType === 'email') {
      const usersPersonal = await db.UsersPersonalModel.find({email: searchContent.trim().toLowerCase()}, {uid: 1});
      match.uid = {$in: usersPersonal.map(u => u.uid)};
    }
    const count = await db.UserModel.countDocuments(match);
    paging = nkcModules.apiFunction.paging(page, count);
    users = await db.UserModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    await Promise.all(users.map(async user => {
      await user.extendGrade();
      await user.extendRoles();
      user.roles.reverse();
    }));
    users = await db.UserModel.extendUsersSecretInfo(users);
    for(const u of users) {
      if(!ctx.permission('visitUserSensitiveInfo')) {
        delete u.mobile;
        delete u.nationCode;
        delete u.email;
        continue;
      }
      u.postNeedReview = await db.UserModel.contentNeedReview(u.uid, 'post');
      u.threadNeedReview = await db.UserModel.contentNeedReview(u.uid, 'thread');
      u.scores = await db.UserModel.getUserScores(u.uid);
      u.badRecords = await db.UserModel.getUserBadRecords(u.uid);
      u.blacklistCount = await db.BlacklistModel.getBlacklistCount(u.uid);
    }
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.users = users;
    data.paging = paging;
    data.t = t;
    data.c = c;
    data.searchType = searchType;
    data.searchContent = searchContent;
    ctx.template = 'experimental/settings/user/user.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {type, disable, usersId} = body;
    let obj;
    if(type === 'disable') {
      if(disable) {
        obj = {
          $addToSet: {
            certs: 'banned'
          }
        }
      } else {
        obj = {
          $pull: {
            certs: 'banned'
          }
        }
      }
    } else if(type === 'hidden') {
      obj = {
        $set: {
          hidden: !!disable
        }
      }
    }
    await db.UserModel.updateMany({uid: {$in: usersId}}, obj);
    await next();
  })

	.get('/:uid', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		await targetUser.extendRoles();
		data.targetUser = await db.UserModel.extendUserSecretInfo(targetUser);
		data.targetUsersPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.roles = await db.RoleModel.find({type: {$in: ['common', 'management']}}).sort({toc: 1});
		await next();
	})
  .put("/:uid", async (ctx, next) => {
    const {params, db, body, nkcModules} = ctx;
    let {
      username = "", description = "", certs = [], email = "",
      mobile = "", nationCode = "", password = ""
    } = body;
    const {uid} = params;
    const targetUser = await db.UserModel.findOnly({uid});
    const targetUsersPersonal = await db.UsersPersonalModel.findOnly({uid});
    const serverSettings = await db.SettingModel.getSettings('server');
    // 用户名重名检测
    if(username) {
      if(targetUser.username !== username) {
        await db.UserModel.checkUsername(username);
        const sameNameUser = await db.UserModel.findOne({uid: {$ne: uid}, usernameLowerCase: username.toLowerCase()});
        if(sameNameUser) ctx.throw(400, "用户名已存在，请更换");
        const sameNameColumn = await db.ColumnModel.findOne({uid: {$ne: uid}, nameLowerCase: username.toLowerCase()});
        if(sameNameColumn) ctx.throw(400, "用户名与专栏名冲突，请更换");
      }
    } else {
      username = `${serverSettings.websiteCode}-${targetUser.uid}`;
    }
    // 邮箱检测
    if(targetUsersPersonal.email !== email && !!email) {
      const sameEmailUser = await db.UsersPersonalModel.findOne({uid: {$ne: uid}, email: email.toLowerCase()});
      if(sameEmailUser) ctx.throw(400, "邮箱已存在，请更换");
    }
    // 手机号码检测
    if(mobile && nationCode && (targetUsersPersonal.mobile !== mobile || targetUsersPersonal.nationCode !== nationCode)) {
      const sameMobileUser = await db.UsersPersonalModel.findOne({uid: {$ne: uid}, nationCode, mobile});
      if(sameMobileUser) ctx.throw(400, "手机号码已被其他用户绑定，请更换");
    }
    // 证书检测
    let certsId = await db.RoleModel.find({_id: {$in: certs}, type: {$in: ["common", "management"]}});
    certsId = certsId.map(cert => cert._id);
    // 保留原有的系统类证书
    let oldCertsId = await db.RoleModel.find({_id: {$in: targetUser.certs}, type: "system"});
    oldCertsId = oldCertsId.map(cert => cert._id);
    certsId = [...new Set(oldCertsId.concat(certsId))];
    const userObj = {
      username,
      usernameLowerCase: username.toLowerCase(),
      description,
      certs: certsId
    };
    const userPersonalObj = {
      mobile,
      nationCode,
      email: email.toLowerCase()
    };

    if(password) {
      const {contentLength, checkPass} = ctx.tools.checkString;
      if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位');
      if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者');
      const newPassword = nkcModules.apiFunction.newPasswordObject(password);
      userPersonalObj.password = newPassword.password;
      userPersonalObj.hashType = newPassword.hashType;
    }
    await targetUser.updateOne(userObj);
    await targetUsersPersonal.updateOne(userPersonalObj);
    await next();
	});
module.exports = userRouter;
