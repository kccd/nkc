const Router = require('koa-router');
const UsersPersonalModel = require("../../../dataModels/UsersPersonalModel");
const VerifiedUploadModel = require("../../../dataModels/VerifiedUploadModel");

const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		await UsersPersonalModel.checkExpiryAuthenticate(uid);
		const userPersonal = await UsersPersonalModel.findOnly({ uid });
    data.boundMobile = !!userPersonal.mobile;
    data.authenticate = userPersonal.authenticate;
		data.targetUser = targetUser;
		data.email = userPersonal.email;
		data.nationCode = userPersonal.nationCode;
		data.mobile = userPersonal.mobile;
		data.authLevel = await userPersonal.getAuthLevel();
    const {auth3Content} = await db.SettingModel.getSettings('auth');
		const verifiedUploadVideo = await db.VerifiedUploadModel.findOne({_id: userPersonal.authenticate.video.attachments[0]}, {state: 1, _id: 1, errorInfo: 1}).sort({toc: -1});
		const verifiedUploadCardA = await db.VerifiedUploadModel.findOne({_id: userPersonal.authenticate.card.attachments[0]}, {state: 1, _id: 1, errorInfo: 1}).sort({toc: -1});
		const verifiedUploadCardB = await db.VerifiedUploadModel.findOne({_id: userPersonal.authenticate.card.attachments[1]}, {state: 1, _id: 1, errorInfo: 1}).sort({toc: -1});
		data.verifiedVideoState = verifiedUploadVideo?verifiedUploadVideo.state:'unUpload';
		data.verifiedAState = verifiedUploadCardA?verifiedUploadCardA.state:'unUpload';
		data.verifiedBState = verifiedUploadCardB?verifiedUploadCardB.state:'unUpload';
		data.videoErrorInfo = verifiedUploadVideo?verifiedUploadCardB.errorInfo:'';
		data.cardAErrorInfo = verifiedUploadCardA?verifiedUploadCardA.errorInfo:'';
		data.cardBErrorInfo = verifiedUploadCardB?verifiedUploadCardB.errorInfo:'';
    data.auth3Content = auth3Content;
		ctx.template = 'experimental/auth/[uid]/index.pug';
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, params, query} = ctx;
		const {uid} = params;
		let {level} = query;
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		if(level === "2") {
			await targetUserPersonal.changeVerify2Status("unsubmit");
			return next();
		}
		if(level === "3") {
			await targetUserPersonal.changeVerify3Status("unsubmit");
			return next();
		}
		return ctx.throw(403, "参数错误");
	})
	.post("/verify2", async (ctx, next) => {
		const { body, data, params, state } = ctx;
		const { uid } = params;
		const { status, expiredDate, message } = body;
		const reviewer = state.uid;
		const reviewDate = Date.now();
		const expiryDate = new Date(expiredDate);
		const userPersonal = await UsersPersonalModel.findOne({ uid });
		if(status === "passed") {
			if(!expiredDate) {
				return ctx.throw(403, "需要填写过期日期");
			}
			await userPersonal.passVerify2({expiryDate, reviewer, reviewDate});
		}
		if(status === "fail") {
			if(!message) {
				return ctx.throw(403, "需要填写不通过原因");
			}
			await userPersonal.rejectVerify2({message, reviewDate, reviewer});
		}
		return next();
	})
	.post("/verify3", async (ctx, next) => {
		const { body, data, params, state } = ctx;
		const { uid } = params;
		const { status, expiredDate, message } = body;
		const reviewer = state.uid;
		const reviewDate = Date.now();
		const expiryDate = new Date(expiredDate);
		const userPersonal = await UsersPersonalModel.findOne({ uid });
		if(status === "passed") {
			if(!expiredDate) {
				return ctx.throw(403, "需要填写过期日期");
			}
			await userPersonal.passVerify3({expiryDate, reviewer, reviewDate});
		}
		if(status === "fail") {
			if(!message) {
				return ctx.throw(403, "需要填写不通过原因");
			}
			await userPersonal.rejectVerify3({message, reviewDate, reviewer});
		}
		return next();
	})
	.get("/a/:vid", async (ctx, next) => {
		const {params, data, db} = ctx;
    const {vid} = params;
    const asset = await VerifiedUploadModel.findOne({ _id: vid });
    if(!asset) {
      return ctx.throw(404, "未找到附件");
    }
    if(!ctx.permission("visitUserAuth")) {
      return ctx.throw(403, "你无权查看此附件");
    }
    ctx.remoteFile = await asset.getRemoteFile();
    ctx.type = asset.ext;
    return next();
	});

module.exports = authRouter;
