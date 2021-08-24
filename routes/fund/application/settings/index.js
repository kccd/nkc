const Router = require('koa-router');
const settingsRouter = new Router();
const memberRouter = require('./member');
const postRouter = require('./post');
const giveUpRouter = require('./giveUp');
const deleteRouter = require('./delete');
const withdrawRouter = require('./withdraw');
const cheerio = require('cheerio');
settingsRouter
  .use('/', async (ctx, next) => {
    const {data, state} = ctx;
    const {applicationForm, fund} = data;
    if(applicationForm.uid !== state.uid) ctx.throw(403, `权限不足`);
    if(applicationForm.disabled) ctx.throw(403,'申请表已被屏蔽');
    if(applicationForm.useless === 'refuse') {
      ctx.throw(403,'申请表已被彻底拒绝');
    } else if(applicationForm.useless === 'giveUp') {
      ctx.throw(403,'申请人已放弃申报');
    } else if(applicationForm.useless === 'stop') {
      ctx.throw(403, `申请已终止`);
    }
    const reg = /^\/fund\/a\/[0-9]+\/settings$/;
    if(reg.test(ctx.url)) {
      // 编辑申请表
      if(applicationForm.modifyCount >= fund.modifyCount) {
        applicationForm.useless = 'exceededModifyCount';
        await applicationForm.updateOne({useless: applicationForm.useless});
      }
      if(applicationForm.useless === 'exceededModifyCount') {
        ctx.throw(403, `申请表的修改次数已超过限制，已无法修改`);
      }
      if(applicationForm.lock.submitted) {
        ctx.throw(403, `申请表已提交，暂无法修改`);
      }
    }
    await next();
  })
	.get('/', async (ctx, next) => {
    const {db, data, params, state} = ctx;
    const applicationForm = await db.FundApplicationFormModel.findOnly({_id: params._id});
    const fund = await db.FundModel.findOnly({_id: applicationForm.fundId});
    const applicant = await applicationForm.extendApplicant();
    const members = await db.FundApplicationUserModel.find({
      applicationFormId: applicationForm._id,
      uid: {$ne: state.uid},
      removed: false
    }).sort({toc: 1});
    const usersId = members.map(m => m.uid);
    const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, avatar: 1, username: 1});
    const posts = await db.PostModel.find({type: 'thread', tid: {$in: applicationForm.threadsId.applying}});
    const forums = await db.ForumModel.find({fid: applicationForm.category}, {fid: 1, displayName: 1});
    const project = await applicationForm.extendProject();
    data.settingsData = {
      applicationForm,
      applicant,
      fund,
      users,
      posts,
      members,
      forums,
      project,
    };
    ctx.template = 'fund/apply/apply.pug';
    await next();
	})
  .post('/', async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {
      fund, applicationForm
    } = data;
    const {form, applicant, project, type} = body;
    const isSubmit = type === 'submit';
    const {checkString, checkNumber} = nkcModules.checkData;

    let {lifePhotosId} = applicant;

    const _applicant = await applicationForm.extendApplicant();

    const {
      account,
      from,
      projectCycle,
      budgetMoney,
      threadsId,
      category
    } = form;
    const {
      name,
      idCardNumber,
      mobile,
      description,
    } = applicant;
    const {
      t,
      c,
      abstractEn,
      abstractCn,
      keyWordsEn,
      keyWordsCn,
    } = project;
    const {
      paymentType,
      bankName,
      name: accountName,
      number,
    } = account;

    const _budgetMoney = [];

    for(let i = 0; i < budgetMoney.length; i++) {
      const {
        count,
        money,
        purpose,
        unit,
        model,
      } = budgetMoney[i];

      _budgetMoney.push({
        count,
        money,
        purpose,
        unit,
        model
        /*total: Math.round(money * 100) * count / 100,
        suggest: suggest || null,
        fact: fact || null*/
      });
    }

    // 找出被移除的照片 ID
    const {lifePhotosId: oldLifePhotosId} = _applicant;
    const deletedLifePhotosId = oldLifePhotosId.filter(id => !lifePhotosId.includes(id));
    // 将生活照复制一份到基金申请
    lifePhotosId = await db.PhotoModel.copyLifePhotosToFund(applicationForm.uid, applicationForm._id, lifePhotosId);

    if(isSubmit) {
      checkString(name, {
        name: '真实姓名',
        minLength: 1,
        maxLength: 30
      });
      checkString(idCardNumber, {
        name: '身份证号码',
        minLength: 18,
        maxLength: 18
      });
      checkString(mobile, {
        name: '联系电话',
        minLength: 5,
        maxLength: 30
      });
      if(fund.auditType === 'system' && paymentType === 'bankCard') {
        ctx.throw(400, `当前基金仅支持支付宝收款`);
      }
      if(paymentType === 'bankCard') {
        checkString(bankName, {
          name: '银行全称',
          minLength: 1,
          maxLength: 30
        });
      }
      checkString(accountName, {
        name: '户名',
        minLength: 1,
        maxLength: 30
      });
      checkString(number, {
        name: '收款账号',
        minLength: 1,
        maxLength: 30
      });
      checkString(description, {
        name: '自我介绍',
        minLength: 1,
        maxLength: 2000
      });
      if(fund.necessaryPhoto && lifePhotosId.length === 0) {
        ctx.throw(400, `请至少选择一张生活照`);
      }
      if(!['personal', 'team'].includes(from)) {
        ctx.throw(400, `请选择申请方式`)
      }
      checkNumber(projectCycle, {
        name: '研究周期',
        min: 1,
      });

      if(!applicationForm.fixedMoney) {
        let total = 0;
        if(_budgetMoney.length === 0) ctx.throw(400, `请输入资金预算`);
        for(let i = 0; i < _budgetMoney.length; i++) {
          const {
            count,
            money,
            purpose,
            suggest,
            fact,
            model,
            unit
          } = _budgetMoney[i];
          const baseName = `资金预算第 ${i + 1} 项 - `;
          checkString(purpose, {
            name: baseName + '用途',
            minLength: 1,
            maxLength: 50
          });
          checkString(model, {
            name: baseName + '规格型号',
            minLength: 0,
            maxLength: 50
          });
          checkNumber(money, {
            name: baseName + '单价',
            min: 0.01,
            fractionDigits: 2
          });
          checkNumber(count, {
            name: baseName + '数量',
            min: 1,
          });
          checkString(unit, {
            name: baseName + '单位',
            minLength: 0,
            maxLength: 50
          });
          _budgetMoney[i].total = Math.round(money * 100) * count / 100;
          _budgetMoney[i].suggest = suggest || null;
          _budgetMoney[i].fact = fact || null;
          total += _budgetMoney[i].total * 100;
        }
        if(total / 100 > fund.money.value) {
          ctx.throw(400, `资金预算总金额已超过该基金单笔申请的最大金额`);
        }
      }


      const agreeMembersId = await db.FundApplicationUserModel.getAgreeMembersId(applicationForm._id);
      const applicationFormUsersId = [applicationForm.uid].concat(agreeMembersId);
      const posts = await db.PostModel.find({
        type: 'thread',
        tid: {
          $in: threadsId.applying
        }
      }, {
        t: 1,
        uid: 1
      });
      if(posts.length !== threadsId.applying.length) ctx.throw(400, `技术文章 ID 错误，请重新选择`);
      for(const post of posts) {
        if(!applicationFormUsersId.includes(post.uid)) {
          ctx.throw(400, `技术文章「${post.t}」不属于你或你的组员，请删除`);
        }
      }
      if(posts.length < fund.thread.count) {
        ctx.throw(400, `请至少选择 ${fund.thread.count} 篇技术文章`);
      }
      if(!category) ctx.throw(400, `请选择学科分类`);
      const formForum = await db.ForumModel.findOne({fid: category}, {fid: 1});
      if(!formForum) ctx.throw(400, `学科分类错误，请重新选择`);

      // 项目信息
      checkString(t, {
        name: '项目名称',
        minLength: 1,
        maxLength: 500
      });
      checkString(abstractCn, {
        name: '中文摘要',
        minLength: 0,
        maxLength: 2000
      });
      checkString(abstractEn, {
        name: '英文摘要',
        minLength: 0,
        maxLength: 2000
      });
      for(const k of keyWordsCn) {
        checkString(k, {
          name: '中文关键词',
          minLength: 1,
          maxLength: 30
        });
      }
      for(const k of keyWordsEn) {
        checkString(k, {
          name: '英文关键词',
          minLength: 1,
          maxLength: 30
        });
      }
      checkString(c, {
        name: '项目内容',
        maxLength: 1000000
      });
      const content = cheerio.load(c);
      const count = content('body').text().length;
      if(count === 0) ctx.throw(400, `项目内容不能为空`);
      if(count > 100000) ctx.throw(400, `项目内容不能超过 10 万字`);

      // 组员
      const members = await db.FundApplicationUserModel.countDocuments({
        applicationFormId: applicationForm._id,
        uid: {$ne: applicationForm.uid},
        type: 'member',
        agree: null,
        removed: false,
      });
      if(members.length > 0) ctx.throw(400, `等一等，还有组员没有上车~`);
      if(from === 'team' && agreeMembersId.length === 0) {
        ctx.throw(400, `请至少添加一个组员`);
      }
      // 删除被移除的基金生活照
      await db.PhotoModel.removeApplicationFormPhotosById(applicationForm.uid, applicationForm._id, deletedLifePhotosId);
    }
    // 更新项目信息
    await applicationForm.updateProject({
      t, c, abstractEn, abstractCn, keyWordsCn, keyWordsEn
    });
    // 更新申请人信息
    await _applicant.updateOne({
      $set: {
        name,
        idCardNumber,
        mobile,
        description,
        lifePhotosId
      }
    });
    // 更新申请表
    await db.FundApplicationFormModel.updateOne({_id: applicationForm._id}, {
      $set: {
        account: {
          paymentType,
          bankName,
          name: accountName,
          number
        },
        from,
        projectCycle,
        budgetMoney: _budgetMoney,
        'threadsId.applying': threadsId.applying,
        category
      }
    });

    if(isSubmit) {
      // 更新申请表总金额
      await db.FundApplicationFormModel.updateMoneyByApplicationFormId(applicationForm._id);
      // 发布申请
      await db.FundApplicationFormModel.publishByApplicationFormId(applicationForm._id);
    } else {
      data.applicantLifePhotosId = lifePhotosId;
    }

    await next();
  })
  .use('/post', postRouter.routes(), postRouter.allowedMethods())
  .use('/member', memberRouter.routes(), memberRouter.allowedMethods())
  .use('/delete', deleteRouter.routes(), deleteRouter.allowedMethods())
  .use('/withdraw', withdrawRouter.routes(), withdrawRouter.allowedMethods())
  .use('/giveup', giveUpRouter.routes(), giveUpRouter.allowedMethods());
module.exports = settingsRouter;