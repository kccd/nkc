const Cookies = require('cookies-string-parse');
const languages = require('../languages');
const cookieConfig = require("../config/cookie");
const resourceOperations = [
  "getAttachment",
  "getUserAvatar",
  "getUserBanner",
  "column_single_avatar_get",
  "column_single_Banner_get",
  "getHomeLogo",
  "getActivityPoster",
  "getForumAvatar",
  "getResources",
  "getThumbs",
  "getMediums",
  "getDefaultImage",
  "getOrigins",
  "getThreadCover",
  "getVideoImg",
  "getSiteSpecific",
  "getAttachmentIcon",
  "getFundLogo",
  "getFundBanner",
  "getPhoto",
  "getSmallPhoto",
  "visitForumBanner",
  "getMessageFile"
];
module.exports = async (ctx, next) => {

  const isResourcePost = resourceOperations.includes(ctx.data.operationId);
  const {data, db, redis} = ctx;
	// cookie
  let userInfo = ctx.getCookie("userInfo");
	// let userInfo = ctx.cookies.get('userInfo', {signed: true});
	if(!userInfo) {
	  // 为了兼容app中的部分请求无法附带cookie，故将cookie放到了url中
		try{
      let {cookie} = ctx.query || {};
      if(cookie) {
        cookie = Buffer.from(cookie, 'base64').toString();
        if(cookie) {
          const cookies = new Cookies(cookie, {
            keys: [cookieConfig.secret]
          });
          userInfo = cookies.get('userInfo', {signed: true});
          if(userInfo) {
            userInfo = Buffer.from(userInfo, "base64").toString();
            userInfo = JSON.parse(userInfo);
          }
        }
      }
		} catch(err) {
		  if(global.NKC.NODE_ENV !== 'production') console.log(err);
		}
	}
	let userOperationsId = [], userRoles = [], userGrade = {}, user, usersPersonal;
	if(userInfo) {
	  try {
	    const {uid, lastLogin = ""} = userInfo;
      const _user = await db.UserModel.findOne({uid});
      if(_user) {
        usersPersonal = await db.UsersPersonalModel.findOne({uid: _user.uid, secret: lastLogin});
        if(usersPersonal) {
          user = _user;
        }
      }
      if(!user) ctx.setCookie('userInfo', '');
    } catch(err) {
      ctx.setCookie('userInfo', '');
    }

	}
  let languageName = 'zh_cn';
	if(!user) {
		// 游客
		const visitorRole = await db.RoleModel.extendRole('visitor');
		userOperationsId = visitorRole.operationsId;
		userRoles = [visitorRole];
	} else {
    // 用户
		const oldUser = await db.UserModel.findOneAndUpdate({uid: user.uid}, {$set: {tlv: Date.now()}});
		if(!user.certs.includes('default')) {
			user.certs.unshift('default');
		}
		if(user.xsf > 0) {
			if(!user.certs.includes('scholar')) {
				user.certs.push('scholar');
			}
		} else {
			const index = user.certs.indexOf('scholar');
			if(index !== -1) {
				user.certs.splice(index, 1);
			}
		}
		// 获取用户信息
    if(ctx.data.operationId === "getResources" || !isResourcePost) {
      const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
      await db.UserModel.extendUsersInfo([user]);
      user.newMessage = await user.getNewMessagesCount();
      user.authLevel = await userPersonal.getAuthLevel();
      user.setPassword = userPersonal.password.salt && userPersonal.password.hash;
      user.boundMobile = userPersonal.nationCode && userPersonal.mobile;
      user.boundEmail = userPersonal.email;
      user.draftCount = await db.DraftModel.count({uid: user.uid});
      user.generalSettings = await db.UsersGeneralModel.findOnly({uid: user.uid});
      languageName = user.generalSettings.language;
      if(user.generalSettings.lotterySettings.status) {
        const redEnvelopeSettings = await db.SettingModel.findOnly({_id: 'redEnvelope'});
        if(redEnvelopeSettings.c.random.close) {
          user.generalSettings.lotterySettings.status = false;
        }
      }
      if(user.generalSettings.draftFeeSettings.kcb !== 0) {
        await user.generalSettings.update({'draftFeeSettings.kcb': 0});
      }
      // 获取新点赞数
      const votes = await db.PostsVoteModel.find({tUid: user.uid, toc: {$gt: oldUser.tlv}, type: "up"}, {_id: 1, uid: 1, pid: 1});
      // 按post分组
      let postGroups = {};
      // 哪个post 哪些人
      for(let vote of votes) {
        let {_id, pid} = vote;
        if(!postGroups[pid]) {
          postGroups[pid] = [];
        }
        postGroups[pid].push(_id.toString());
      }
      // 最新点赞中包含多少个post就会生成多少条消息
      for(let pid in postGroups) {
        const votesId = postGroups[pid];
        // 发系统通知
        await db.MessageModel({
          _id: await db.SettingModel.operateSystemID('messages', 1),
          r: user.uid,
          ty: 'STU',
          port: ctx.port,
          ip: ctx.address,
          c: {
            type: 'latestVotes',
            votesId
          }
        }).save();
      }
    }
    userGrade = await user.extendGrade();
    // 判断用户是否被封禁
		if(user.certs.includes('banned')) {
      const role = await db.RoleModel.extendRole('banned');
        if(!role) return;
        userRoles.push(role);
        for(let operationId of role.operationsId) {
          if(!userOperationsId.includes(operationId)) {
            userOperationsId.push(operationId);
          }
        }
		} else {
      // 除被封用户以外的所有用户都拥有普通角色的权限
      const defaultRole = await db.RoleModel.extendRole('default');
			userOperationsId = defaultRole.operationsId;
			// 根据用户积分计算用户等级，并且获取该等级下的所有权限
      if(userGrade) {
				userOperationsId = userOperationsId.concat(userGrade.operationsId);
      }
      // 根据用户的角色获取权限
      await Promise.all(user.certs.map(async cert => {
        const role = await db.RoleModel.extendRole(cert);
        if(!role) return;
        userRoles.push(role);
        for(let operationId of role.operationsId) {
          if(!userOperationsId.includes(operationId)) {
            userOperationsId.push(operationId);
          }
        }
      }));
		}
		// 重置cookie的过期时间，让有活动的用户保持登录
    ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
      lastLogin: usersPersonal.secret
    });
  }
  // 根据用户语言设置加载语言对象
  ctx.state.language = languages[languageName];
  ctx.state.lang = (type, operationId) => {
    return ctx.state.language[type][operationId] || operationId;
  };

	data.userOperationsId = [...new Set(userOperationsId)];
	data.userRoles = userRoles;
	data.userGrade = userGrade;
  data.user = user;
  data.uid = user? user.uid: null;

  // 专业树状结构
  if(!isResourcePost) {
    ctx.state.forumsTree = await db.ForumModel.getForumsTree(
      data.userRoles,
      data.userGrade,
      data.user
    );
    const forumsObj = {};
    ctx.state.forumsTree.map(f => {
      const {categoryId} = f;
      if(!forumsObj[categoryId]) forumsObj[categoryId] = [];
      forumsObj[categoryId].push(f);
    });
    ctx.state.forumCategories = await db.ForumCategoryModel.getCategories();

    ctx.state.categoryForums = [];
    ctx.state.forumCategories.map(fc => {
      const _fc = Object.assign({}, fc);
      const {_id} = _fc;
      _fc.forums = forumsObj[_id] || [];
      if(_fc.forums.length) ctx.state.categoryForums.push(_fc);
    });
  }
  // 获取用户的关注
  if(data.user && !isResourcePost) {
    data.user.subUid = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
    ctx.state.subUsersId = [...data.user.subUid];
    ctx.state.visibleFid = await db.ForumModel.visibleFid(
      data.userRoles,
      data.userGrade,
      data.user
    );
    // 关注的专业对象 用在手机网页侧栏专业导航
    ctx.state.subForums = await db.ForumModel.getUserSubForums(data.user.uid, ctx.state.visibleFid);
    ctx.state.subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
    ctx.state.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(data.user.uid);
    ctx.state.columnPermission = await db.UserModel.ensureApplyColumnPermission(data.user);
    ctx.state.userColumn = await db.UserModel.getUserColumn(data.user.uid);
    ctx.state.userScores = await db.UserModel.getUserScores(data.user.uid);

    data.user.roles = userRoles;
    data.user.grade = userGrade;
  }
  await next();
};
