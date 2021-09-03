const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {data, state} = ctx;
    const {applicationForm, fund} = data;
    if(ctx.url.indexOf(`/fund/a/${applicationForm._id}/manage/audit/project`) === 0) {
      // 项目审核
      // 判断用户是否为基金专家
      await fund.checkFundRole(state.uid, 'expert');
      // 判断基金是否需要项目审核
      if(applicationForm.status.projectPassed !== null) {
        ctx.throw(403, `申请表不需要审核，请刷新`);
      }
      data.type = 'project';
    } else {
      // 管理员复核
      // 判断用户是否为基金管理员啊
      await fund.checkFundRole(state.uid, 'admin');
      // 判断基金是否需要管理员复核
      if(
        applicationForm.status.adminSupport !== null ||
        applicationForm.status.projectPassed !== true
      ) {
        ctx.throw(403, `申请表不需要审核，请刷新`);
      }
      data.type = 'info';
    }
    // 判断申请者是否提交了基金申请表
    if(
      !applicationForm.status.submitted ||
      !applicationForm.lock.submitted
    ) ctx.throw(400, '申请表暂不需要审核，请刷新');
    const {lock} = applicationForm;
    const {auditing, uid, timeToOpen} = lock;
    const {timeOfAudit} = ctx.settings.fund;
    const _auditing = auditing && (Date.now() - timeToOpen) < timeOfAudit;
    if(_auditing) {
      // 如果申请表处于正在审核的状态，则判断审核人是否为当前用户
      if(state.uid !== uid) ctx.throw(403, `当前申请表正在被其他人审核`);
    } else if(ctx.method === 'POST') {
      // 如果申请表未处于审核状态，则将申请表改为审核状态并记录当前用户为审核员
      lock.uid = state.uid;
      lock.timeToOpen = Date.now();
      lock.timeToClose = null;
      lock.auditing = true;
      await applicationForm.save();
    } else if(ctx.method === 'POST') {
      // 提交审核结果时发现申请表未处于审核状态
      ctx.throw(403, `审核超时，请备份已填写的信息，刷新页面后重新提交`);
    }
    ctx.template = 'fund/manage/audit/audit.pug';
    await next();
  })
  .get('/project', async (ctx, next) => {
    const {db, data} = ctx;
    const {applicationForm} = data;
    data.expertAudit = await db.FundDocumentModel.find({
      applicationFormId: applicationForm._id,
      type: {
        $in: [
          'userInfoAudit', 'projectAudit', 'moneyAudit'
        ]
      }
    }).sort({toc: -1}).limit(3);
    await next();
  })
  .post('/project', async (ctx, next) => {
    const {data, body, nkcModules, state} = ctx;
    const {applicationForm} = data;
    const {checkNumber} = nkcModules.checkData;
    const {suggest, comments} = body;
    let passed = true;
    let userInfoAudit;
    const types = {
      'userInfoAudit': '用户信息',
      'projectAudit': '项目信息',
      'moneyAudit': '资金预算'
    };
    for(const comment of comments) {
      const {type, c, support} = comment;
      const name = types[type];
      if(c.length > 5000) {
        ctx.throw(400, `${name}审核评语不能超过 5000 个字`);
      }
      if(!support && !c) {
        ctx.throw(400, `${name}审核评语不能为空`);
      }
      if(!support) passed = false;
      if(type === 'userInfoAudit') {
        userInfoAudit = comment;
      }
    }

    let total = 0;
    let suggestTotal = 0;
    for(let i = 0; i < applicationForm.budgetMoney.length; i++) {
      const b = applicationForm.budgetMoney[i];
      checkNumber(suggest[i], {
        name: `${b.purpose} - 专家建议金额`,
        min: 0,
        fractionDigits: 2,
      });
      total += b.total * 100;
      suggestTotal += suggest[i] * 100;

      b.suggest = suggest[i];
    }

    if((suggestTotal < total * 0.8) && passed) {
      ctx.throw(400, `专家建议金额低于预算 80% 时，资金预算审核只能选择不合格`);
    }

    for(const comment of comments) {
      const {type, c, support} = comment;
      await applicationForm.createReport(type, c, state.uid, support);
    }

    await applicationForm.updateOne({
      $set: {
        budgetMoney: applicationForm.budgetMoney,
      }
    });

    applicationForm.status.projectPassed = passed;

    data.passed = passed;

    await applicationForm.save();

    await next();
  })
  .get('/info', async (ctx, next) => {
    const {data, db} = ctx;
    const {applicationForm} = data;
    data.adminAudit = await db.FundDocumentModel.findOne({
      applicationFormId: applicationForm._id,
      type: 'adminAudit'
    })
      .sort({toc: -1});
    await next();
  })
  .post('/info', async (ctx, next) => {
    const {data, body, nkcModules, state} = ctx;
    const {applicationForm} = data;
    const {comment, fact, remittance, reportNeedThreads} = body;
    const {checkNumber} = nkcModules.checkData;
    const {type, c, support} = comment;
    if(c.length > 5000) {
      ctx.throw(400, `审核评语不能超过 5000 个字`);
    }
    if(!support && !c) {
      ctx.throw(400, `审核评语不能为空`);
    }
    data.passed = support;
    let total = 0;
    let factTotal = 0;

    if(applicationForm.fixedMoney) {
      factTotal = applicationForm.money * 100;
    } else {
      for(let i = 0; i < applicationForm.budgetMoney.length; i++) {
        const b = applicationForm.budgetMoney[i];
        checkNumber(fact[i], {
          name: `${b.purpose} - 专家建议金额`,
          min: 0,
          fractionDigits: 2,
        });
        total += b.total * 100;
        factTotal += fact[i] * 100;

        b.fact = fact[i];
      }
      if((factTotal < total * 0.8) && support) {
        ctx.throw(400, `实际批准金额低于预算 80% 时，资金预算审核只能选择不合格`);
      }
    }

    const formRemittance = [];
    let remittanceTotal = 0;
    for(const m of remittance) {
      checkNumber(m, {
        name: '分期金额',
        min: 0.01,
        fractionDigits: 2
      });
      remittanceTotal += m * 100;
      formRemittance.push({
        money: m,
        status: null,
        report: null,
        passed: null
      });
    }
    if(remittanceTotal !== factTotal) {
      ctx.throw(400, `分期总金额不等于实际批准金额`);
    }

    await applicationForm.updateOne({
      $set: {
        budgetMoney: applicationForm.budgetMoney
      }
    });

    applicationForm.remittance = formRemittance;

    applicationForm.status.adminSupport = support;

    applicationForm.reportNeedThreads = !!reportNeedThreads;

    await applicationForm.save();

    await applicationForm.createReport(type, c, state.uid, support);

    await next();
  })
  .use('/', async (ctx, next) => {
    const {db, data} = ctx;
    if(ctx.method !== 'POST') return await next();
    const {type, passed, applicationForm, fund} = data;
    if(!passed) {
      if(applicationForm.modifyCount >= fund.modifyCount) {
        applicationForm.useless = 'exceededModifyCount';
      }
      applicationForm.lock.submitted = false;
    }

    applicationForm.tlm = new Date();

    await applicationForm.save();

    if(type === "project") {
      if(passed) {
        await db.MessageModel.sendFundMessage(applicationForm._id, "admin");
      } else {
        await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
      }
    } else if(type === "info") {
      await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
    }

    await next();
  });
module.exports = router;