const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	// 具体某个基金项目设置页面
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({}, {
      _id: 1,
      name: 1,
    }).sort({toc: 1});
		const {fund} = data;
    data.roles = await db.RoleModel.find({}, {_id: 1, displayName: 1}).sort({toc: 1});
    const usersId = new Set([
      ...fund.admin.appointed,
      ...fund.censor.appointed,
      ...fund.financialStaff.appointed,
      ...fund.expert.appointed,
      ...fund.voter.appointed
    ]);
    data.users = await db.UserModel.find({uid: {$in: [...usersId]}}, {uid: 1, username: 1, avatar: 1});
    ctx.template = 'fund/list/settings.pug';
		await next();
	})
  .put('/', async (ctx, next) => {
    const {data, db, body, nkcModules} = ctx;
    const newFund = JSON.parse(body.fields.fund);
    const files = body.files;
    const {
      fund: oldFund
    } = data;
    const {checkString, checkNumber} = nkcModules.checkData;
    if(newFund._id !== oldFund._id) ctx.throw(400, `数据错误，请刷新后再试`);
    if(!['system', 'person'].includes(newFund.auditType)) ctx.throw(400, `请选择审核方式`);
    checkString(newFund.name, {
      name: '基金名称',
      minLength: 1,
      maxLength: 100
    });
    checkNumber(newFund.money.value, {
      name: '金额',
      min: 0.01,
      fractionDigits: 2,
    });
    checkString(newFund.color, {
      name: '颜色值',
      minLength: 1
    });
    checkString(newFund.description.brief, {
      name: '基金简介',
      minLength: 1,
      maxLength: 500
    });
    checkString(newFund.description.detailed, {
      name: '基金说明',
      minLength: 1,
      maxLength: 20000
    });
    checkString(newFund.description.terms, {
      name: '基金条款',
      minLength: 1,
      maxLength: 20000
    });
    const applicantOptions = [
      ['userLevel', '用户等级'],
      ['threadCount', '文章数'],
      ['postCount', '回复数'],
      ['timeToRegister', '注册天数'],
      ['authLevel', '申请人身份认证等级']
    ];
    for(const ao of applicantOptions) {
      checkNumber(newFund.applicant[ao[0]], {
        name: `申请人资格 - ${ao[1]}`,
        min: 0
      });
    }
    checkNumber(newFund.member.authLevel, {
      name: '申请人资格 - 组员身份认证等级',
      min: 0
    });
    for(const t of newFund.applicantType) {
      if(!['personal', 'team'].includes(t)) ctx.throw(400, `项目设置 - 申请方式数据错误`);
    }
    checkNumber(newFund.thread.count, {
      name: '项目设置 - 附带文章数',
      min: 1
    });
    const projectOptions = [
      ['modifyCount', '最大退修次数'],
      ['modifyTime', '修改超时天数'],
      ['supportCount', '好友支持数'],
      ['timeOfPublicity', '示众天数'],
      ['applicationCountLimit', '年最大申请次数']
    ];
    for(const po of projectOptions) {
      checkNumber(newFund[po[0]], {
        name: `项目设置 - ${po[1]}`,
        min: 0
      });
    }
    checkString(newFund.reminder.inputUserInfo, {
      name: '自我介绍提示',
      minLength: 1,
      maxLength: 10000,
    });
    checkString(newFund.reminder.inputProject, {
      name: '项目内容提示',
      minLength: 1,
      maxLength: 10000,
    });
    const roles = await db.RoleModel.find({}, {_id: 1});
    const rolesId = roles.map(r => r._id);
    const permissionOptions = [
      ['admin', '管理员'],
      ['censor', '检查员'],
      ['financialStaff', '财务'],
      ['expert', '专家'],
      ['voter', '投票人员']
    ];
    for(const po of permissionOptions) {
      const {certs, appointed} = newFund[po[0]];
      for(const c of certs) {
        if(!rolesId.includes(c)) ctx.throw(400, `权限设置 - ${po[1]}证书数据错误`);
      }
      if(appointed.length !== 0) {
        const users = await db.UserModel.find({uid: {$in: appointed}}, {uid: 1});
        newFund[po[0]].appointed = users.map(u => u.uid);
      }
    }
    await db.FundModel.updateOne({_id: oldFund._id}, {
      $set: {
        disabled: !!newFund.disabled,
        display: !!newFund.display,
        auditType: newFund.auditType,
        canApply: !!newFund.canApply,
        history: !!newFund.history,
        name: newFund.name,
        money: {
          fixed: !!newFund.money.fixed,
          value: newFund.money.value
        },
        color: newFund.color,
        description: {
          brief: newFund.description.brief,
          detailed: newFund.description.detailed,
          terms: newFund.description.terms
        },
        necessaryPhoto: !!newFund.necessaryPhoto,
        applicant: {
          userLevel: newFund.applicant.userLevel,
          threadCount: newFund.applicant.threadCount,
          postCount: newFund.applicant.postCount,
          timeToRegister: newFund.applicant.timeToRegister,
          authLevel: newFund.applicant.authLevel,
        },
        member: {
          authLevel: newFund.member.authLevel
        },
        detailedProject: !!newFund.detailedProject,
        applicantType: newFund.applicantType,
        thread: {
          count: newFund.thread.count,
        },
        modifyCount: newFund.modifyCount,
        modifyTime: newFund.modifyTime,
        supportCount: newFund.supportCount,
        timeOfPublicity: newFund.timeOfPublicity,
        applicationCountLimit: newFund.applicationCountLimit,
        conflict: {
          self: newFund.conflict.self,
          other: newFund.conflict.other
        },
        reminder: {
          inputUserInfo: newFund.reminder.inputUserInfo,
          inputProject: newFund.reminder.inputProject
        },
        admin: newFund.admin,
        censor: newFund.censor,
        financialStaff: newFund.financialStaff,
        expert: newFund.expert,
        voter: newFund.voter
      }
    });
    const newImage = {};
    if(files.avatar) {
      newImage.avatar = await db.AttachmentModel.saveFundImage(files.avatar, 'fundAvatar');
    }
    if(files.banner) {
      newImage.banner = await db.AttachmentModel.saveFundImage(files.banner, 'fundBanner');
    }
    if(newImage.avatar || newImage.banner) {
      await db.FundModel.updateOne({_id: oldFund._id}, {
        $set: newImage
      })
    }
    await next();
  })
module.exports = settingsRouter;