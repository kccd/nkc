const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {state, data} = ctx;
    const {applicationForm} = data;
    if(state.uid !== applicationForm.uid) ctx.throw(403, `权限不足`);
    if(applicationForm.completedAudit) ctx.throw(400, '你已经申请结题，不能再申请拨款');
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.reportAudit = await db.FundDocumentModel.findOne({type: 'reportAudit'}).sort({toc: -1});
    ctx.template = 'fund/remittance/apply.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {applicationForm} = data;
    const {account, fund, timeToPassed, reportNeedThreads} = applicationForm;
    const {number, c, selectedThreads} = body;

    // 系统审核
    // 系统审核不存在分期拨款
    // 若分期不正确则修复分期
    // 自动拨款只支持支付宝账号
    // 当自动拨款出错，若是用户输入的用户名或账号错误则直接更改申请表为未提交的状态，用户可编辑后再提交，否则等待财务人员处理

    const insertReportStart = async () => {
      await applicationForm.createReport(
        'system',
        `申请第 ${number + 1} 期拨款`,
        applicationForm.uid,
        null
      );
    };

    if(fund.auditType === 'system') {
      if(account.paymentType !== 'alipay') ctx.throw(400, '系统审核只支持支付宝收款');
      await insertReportStart();
      try{
        await applicationForm.transfer({
          number,
          operatorId: applicationForm.uid,
          clientIp: ctx.address,
          clientPort: ctx.port
        });
        await applicationForm.createReport(
          'system',
          `第 ${number + 1} 期拨款成功`,
          applicationForm.uid,
          true
        );
      } catch(err) {
        await applicationForm.createReport(
          'system',
          `第 ${number + 1} 期拨款失败: ${err.message || err.toString()}`,
          applicationForm.uid,
          false
        );
        throw err;
      }
      await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
    } else {
      await applicationForm.checkRemittanceNumber(number);
      const r = applicationForm.remittance[number];
      const membersId = await db.FundApplicationUserModel.getMembersUidByApplicationFromId(applicationForm._id);
      membersId.push(applicationForm.uid);
      if(number !== 0 && reportNeedThreads) {
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
        if(threads.length === 0) ctx.throw(400, `申请拨款必须附带代表中期报告的文章`);
        for(const thread of threads) {
          if(thread.toc < timeToPassed) {
            ctx.throw(400, `请选择申请项目之后所发表的文章`);
          }
        }
        r.threads = threads.map(t => t.tid);
      }
      await insertReportStart();
      const report = await applicationForm.createReport(
        'report',
        c,
        applicationForm.uid,
        null
      );
      r.report = report._id;
      r.passed = null;
      r.apply = true;
      await applicationForm.updateOne({
        $set: {
          remittance: applicationForm.remittance,
          submittedReport: number !== 0
        }
      });
      /*// 人工审核
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
              await Promise.all(selectedThreads.map(async tid => {
                const thread = await db.ThreadModel.findOnly({tid});
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
              r.threads = selectedThreads.map(tid => tid.toString());
              r.passed = null;
              r.apply = true;
            }
            await applicationForm.updateOne({remittance, submittedReport: i !== 0})
          }
          break;
        }
      }*/
      await db.MessageModel.sendFundMessage(applicationForm._id, "financialStaff");
    }
    await next();
  })
module.exports = router;