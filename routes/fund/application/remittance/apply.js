const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db, state} = ctx;
    const {applicationForm} = data;
    if(applicationForm.uid !== state.uid) ctx.throw(403,'权限不足');
    data.reportAudit = await db.FundDocumentModel.findOne({type: 'reportAudit'}).sort({toc: -1});
    ctx.template = 'fund/remittance/apply.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {applicationForm, user} = data;
    const {money, account, fund, remittance, timeToPassed, reportNeedThreads} = applicationForm;
    if(!applicationForm.lock.submitted) ctx.throw(400, '抱歉！该申请表暂未提交。');
    if(applicationForm.uid !== user.uid) ctx.throw(403,'权限不足');
    if(applicationForm.completedAudit) ctx.throw(400, '您已经申请结题，不能再申请拨款。');
    const {number, c, selectedThreads} = body;

    // 系统审核
    // 系统审核不存在分期拨款
    // 若分期不正确则修复分期
    // 自动拨款只支持支付宝账号
    // 当自动拨款出错，若是用户输入的用户名或账号错误则直接更改申请表为未提交的状态，用户可编辑后再提交，否则等待财务人员处理
    if(fund.auditType === 'system') {
      if(remittance.length !== 1) {
        const remittance = [{
          money: applicationForm.money,
          status: null
        }];
        await applicationForm.updateOne({remittance});
      }
      if(remittance[0].status) ctx.throw(400, '拨款已成功，请勿重复提交。');
      if(account.paymentType !== 'alipay') ctx.throw(400, '系统审核只支持支付宝账号。');
      const balance = await db.FundBillModel.getBalance('fund', fund._id);
      if(remittance[0].money > balance) ctx.throw(400, '该基金余额不足。');
      const {number, name} = account;
      const {alipay2} = ctx.nkcModules;
      let alipayData;
      const _id = Date.now();
      const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
      const newReport = db.FundDocumentModel({
        _id: newId,
        uid: user.uid,
        applicationFormId: applicationForm._id,
        type: 'system',
        c: `申请第 1 期拨款`,
        support: true
      });
      await newReport.save();
      try {
        alipayData = await alipay2.transfer({
          account: number,
          name,
          money,
          id: _id,
          notes: `${applicationForm.code}第1期拨款`
        });
        const newBill = db.FundBillModel({
          _id,
          money,
          from: {
            type: 'fund',
            id: fund._id
          },
          to: {
            type: 'user',
            id: user.uid,
            anonymous: false
          },
          verify: true,
          applicationFormId: applicationForm._id,
          abstract: '拨款',
          notes: `${applicationForm.code}第1期拨款`,
          uid: fund.admin.appointed[0],
          otherInfo: {
            paymentType: 'alipay',
            transactionNumber: alipayData.orderId,
            name,
            account: number
          }
        });
        await newBill.save();
        remittance[0].status = true;
        await applicationForm.updateOne({'status.remittance': true, remittance});
        const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
        const newReport = db.FundDocumentModel({
          _id: newId,
          uid: fund.admin.appointed[0],
          applicationFormId: applicationForm._id,
          type: 'system',
          c: `第 1 期拨款 ${money}元 完成`,
          support: true
        });
        await newReport.save();
      } catch (err) {
        const errorInfo = err.message;
        const updateObj = {};
        const documentId = await db.SettingModel.operateSystemID('fundDocuments', 1);
        let description = errorInfo;
        remittance[0].status = false;
        remittance[0].subCode = description;
        remittance[0].description = description;
        updateObj.remittance = remittance;
        const newDocument = db.FundDocumentModel({
          _id: documentId,
          type: 'remittance',
          uid: fund.admin.appointed[0],
          applicationFormId: applicationForm._id,
          c: description,
          support: false
        });
        await applicationForm.updateOne(updateObj);
        await newDocument.save();
      }
      await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
    } else {
      // 人工审核
      // 申请第一期拨款不需要附带文章
      // 附带文章的发表时间必须晚于申请表申请时间
      for(let i = 0; i < remittance.length; i++) {
        const r = remittance[i];
        if(i < number) {
          if(!r.status) ctx.throw(400, `第 ${i+1} 期尚未完成拨款，请依次申请拨款。`);
          if(!r.verify) ctx.throw(400, `请先确认收款后再申请后面的拨款。`);
        }
        if(i === number) {
          if(r.status === false) {
            ctx.throw(400, `拨款已失败：${r.description}`);
          } else if(r.status === true) {
            ctx.throw(400, `拨款已完成，请勿重复提交。`);
          } else {
            // 申请第一期拨款不需要附带文章
            if(i === 0) {
              r.passed = true;
              r.apply = true;
              const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
              const newReport = db.FundDocumentModel({
                _id: newId,
                uid: user.uid,
                applicationFormId: applicationForm._id,
                type: 'system',
                c: `申请第 1 期拨款`,
                support: true
              });
              await newReport.save();
            } else {
              if(reportNeedThreads && selectedThreads.length === 0) {
                ctx.throw(400, '申请拨款必须要附带代表中期报告的文章。');
              }
              //验证附带文章的发表时间
              await Promise.all(selectedThreads.map(async t => {
                const thread = await db.ThreadModel.findOnly({tid: t.tid});
                if(thread.toc < timeToPassed) ctx.throw(400, '请选择申请项目之后所发的文章。')
              }));
              const reportId_1 = await db.SettingModel.operateSystemID('fundDocuments', 1);
              const reportId_2 = await db.SettingModel.operateSystemID('fundDocuments', 1);
              const obj = {
                _id: reportId_1,
                uid: user.uid,
                type: 'report',
                applicationFormId: applicationForm._id,
                c
              };
              const report_1 = db.FundDocumentModel(obj);
              obj.c = `申请第 ${i+1} 期拨款`;
              obj.support = true;
              obj._id = reportId_2;
              obj.type = "system";
              const report_2 = db.FundDocumentModel(obj);
              await report_1.save(); // 提交的报告
              await report_2.save(); // 自动生成的报告
              r.report = reportId_1;
              r.threads = selectedThreads.map(t => t.tid.toString());
              r.passed = null;
              r.apply = true;
            }
            await applicationForm.updateOne({remittance, submittedReport: i !== 0})
          }
          break;
        }
      }
      await db.MessageModel.sendFundMessage(applicationForm._id, "financialStaff");
    }
    await next();
  })
module.exports = router;