const Router = require('koa-router');
const completeRouter = new Router();
const auditRouter = require('./audit');
completeRouter
	.use('/', async (ctx, next) => {
		const {data} = ctx;
		const {applicationForm} = data;
		const {useless, disabled} = applicationForm;
		if(disabled) ctx.throw(403,'申请表已被屏蔽');
		if(useless !== null) ctx.throw('申请表已失效，无法完成该操作');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, applicationForm} = data;
		const {status, remittance} = applicationForm;
		for(let r of remittance) {
			if(r.status === true && !r.verify) {
				ctx.throw(400, '请先确认收款后再申请结题。');
			}
		}
		if(user.uid !== applicationForm.uid) ctx.throw('权限不足');
		if(status.completed === false) {
			data.auditComments = {};
			data.auditComments.completedAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedAudit', disabled: false}).sort({toc: -1});
			data.completedReport = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedReport', disabled: false}).sort({toc: -1});
		}
    ctx.template = 'fund/complete/complete.pug';
    await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, nkcModules} = ctx;
		const {checkString, checkNumber} = nkcModules.checkData;
		const {applicationForm, user} = data;
		const {actualMoney, c, selectedThreads, successful} = body;
		const {status, fixedMoney, timeToPassed, remittance} = applicationForm;
    if(status.completed) ctx.throw('该项目已结题');
    for(let r of remittance) {
			if(r.status === true && !r.verify) {
				ctx.throw(400, '请先确认收款后再申请结题。');
			}
		}
		if(user.uid !== applicationForm.uid) ctx.throw('权限不足');

		if(applicationForm.completedAudit) ctx.throw(403, `结题申请已提交`);

		let _actualMoney = [];

    if(!fixedMoney) {
      for(let i = 0; i < actualMoney.length; i++) {
        const {
          purpose,
          model,
          money,
          count,
          unit,
        } = actualMoney[i];
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
        _actualMoney.push({
          purpose,
          model,
          money,
          count,
          unit,
          total: Math.round(money * 100) * count / 100
        });
      }

      if(actualMoney.length === 0) ctx.throw(400, '请输入实际使用金额。');

      await applicationForm.updateOne({actualMoney: _actualMoney});
    }

		//验证帖子的时间
    const membersId = await db.FundApplicationUserModel.getMembersUidByApplicationFromId(applicationForm._id);
    membersId.push(applicationForm.uid);
    const threads = await db.ThreadModel.find({
      tid: {
        $in: selectedThreads
      },
      uid: {
        $in: membersId
      }
    }, {
      toc: 1,
      tid: 1
    });
    if(threads.length === 0) ctx.throw(400, `请至少选择一篇文章作为结题报告`);
    for(const thread of threads) {
      if(thread.toc < timeToPassed) {
        ctx.throw(400, `请选择申请项目之后所发表的文章`);
      }
    }
    const threadsId = threads.map(t => t.tid);

    await applicationForm.createReport('completedReport', c, applicationForm.uid, null);
    await applicationForm.createReport('system', '提交结题申请', applicationForm.uid, null);

		applicationForm.threadsId.completed = threadsId;
		applicationForm.status.successful = successful;
		applicationForm.timeOfCompleted = Date.now();
		applicationForm.completedAudit = true;
		applicationForm.status.completed = null;
		applicationForm.tlm = Date.now();
		await applicationForm.save();
		await db.MessageModel.sendFundMessage(applicationForm._id, "expert");
		await next();
	})
  .use('/audit', auditRouter.routes(), auditRouter.allowedMethods());
module.exports = completeRouter;
