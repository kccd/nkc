const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const {fundId} = ctx.params;
    const {agree} = ctx.query;
    const fund = await db.FundModel.findOnly({_id: fundId});
    data.fundList = await db.FundModel.find({display: true}).sort({toc: 1});
	  data.fund = fund;
	  const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
	  const {photos} = userPersonal.privateInformation;
	  data.photos = photos;
	  ctx.template = 'interface_fund_applicationForm.pug';
    //查寻是否还有未结项的申请
    const query = db.FundApplicationFormModel.match({
	    complete: null
    });
    query.uid = user.uid;
    const applications = await db.FundApplicationFormModel.find(query);
    if(applications.length < 1) {
    	//权限判断
	    try {
	    	fund.ensurePermission(user);
	    } catch(err) {
	    	ctx.throw(401, err);
	    }
    	if(agree === 'true') {
    		// 同意条款
		    const newId = await db.SettingModel.operateSystemID('fundApplications', 1);
		    const newApplication = db.FundApplicationFormModel({
			    _id: newId,
			    uid: user.uid,
			    fundId: fundId
		    });
		    await newApplication.save();
		    data.application = newApplication;
	    }
    }
    if(applications.length === 1) {
	    data.application = applications[0];
	    data.info = '您还有未完成的基金申请，请'
    }
    if(applications.length > 1){
    	ctx.throw(500, '基金申请表数据异常，请与管理员联系');
    }
	  return await next();
  })
  .post('/:applicationFormId', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {updateObj} = ctx.body;
    const {applicationFormId} = ctx.params;
    const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId, uid: user.uid});
    await applicationForm.update(updateObj);
    await next();
  });
module.exports = applicationRouter;
