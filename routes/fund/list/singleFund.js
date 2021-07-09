const router = require('koa-router')();
const apiFn = require('../../../nkcModules/index').apiFunction;
const billsRouter = require('./bills');
const settingsRouter = require('./settings');
const addRouter = require('./add');
router
  .use('/', async (ctx, next) => {
    const {params, db, data} = ctx;
    const {fundId} = params;
    data.fund = await db.FundModel.findOnly({_id: fundId.toUpperCase()});
    await next();
  })
  // 修改基金项目
  .put('/', async (ctx, next) => {
    const {data, db} = ctx;
    const fundId = ctx.params.fundId.toUpperCase();
    const {fundObj} = ctx.body;
    const fund = await db.FundModel.findOnly({_id: fundId});
    if(!fundObj.applicationMethod.personal && !fundObj.applicationMethod.team) ctx.throw(400, '必须勾选申请方式。');
    if(fundObj.auditType === 'system' && fundObj.admin.appointed.length === 0) {
      ctx.throw(400, '系统审核必须指定管理员UID。');
    }
    await fund.updateOne(fundObj);
    data.fund = fund;
    await next();
  })
  // 具体基金项目信息页面
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {fundId} = ctx.params;
    const {type, sort, token} = ctx.query;
    const {FundApplicationFormModel} = db;
    let page = ctx.query.page;
    page = page? parseInt(page): 0;
    data.type = type;
    data.page = page;
    data.sort = sort;

    // 权限判断
    if(token){
      let share = await db.ShareModel.findOne({"token":token});
      if(!share) ctx.throw(403, "无效的token");
      // 获取分享限制时间
      let shareLimitTime;
      let allShareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
      let fundlistShareLimit = await db.ShareLimitModel.findOne({"shareType":"fundlist"});
      if(fundlistShareLimit){
        shareLimitTime = fundlistShareLimit.shareLimitTime;
      }else{
        shareLimitTime = allShareLimit.shareLimitTime;
      }
      let shareTimeStamp = parseInt(new Date(share.toc).getTime());
      let nowTimeStamp = parseInt(new Date().getTime());
      if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimitTime){
        await db.ShareModel.updateOne({"token": token}, {$set: {tokenLife: "invalid"}});
      }
      if(share.shareUrl.indexOf(ctx.path) === -1) ctx.throw(403, "无效的token")
    }

    const fund = await db.FundModel.findOnly({_id: fundId.toUpperCase(), disabled: false});
    data.fund = fund;
    let query = {
      'status.submitted': true,
      fundId: fund._id
    };
    if(!fund.ensureOperatorPermission('admin', user)) {
      query.disabled = false;
    }

    const sortObj = {};
    if(sort === 'tlm') {
      sortObj.tlm = -1;
    } else {
      sortObj.timeToSubmit = -1;
    }

    if(type === 'excellent') { // 优秀项目
      query['status.excellent'] = true;
    } else if(type === 'completed'){ // 已完成
      query['status.completed'] = true;
    } else if(type === 'funding') { // 资助中
      query['status.completed'] = {$ne: true};
      query['status.adminSupport'] = true;
    } else if(type === 'auditing') { // 审核中
      query['status.adminSupport'] = {$ne: true};
      query.useless = null;
    } else { // 全部

    }
    const length = await FundApplicationFormModel.countDocuments(query);
    const paging = apiFn.paging(page, length);
    const applicationForms = await FundApplicationFormModel.find(query).sort(sortObj).skip(paging.start).limit(paging.perpage);
    data.applicationForms = await Promise.all(applicationForms.map(async a => {
      await a.extendApplicant();
      await a.extendMembers();
      await a.extendProject();
      return a;
    }));
    data.paging = paging;
    //改由前端判断
    if(data.user) {
      data.message = await fund.getConflictingByUser(user);
      const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
      data.authLevel = await userPersonal.getAuthLevel();
    }
    ctx.template = 'interface_fund_home.pug';
    await next();
  })
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/add', addRouter.routes(), addRouter.allowedMethods())
  .use('/bills', billsRouter.routes(), billsRouter.allowedMethods());
module.exports = router;