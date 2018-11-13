const Router = require('koa-router');
const releaseRouter = new Router();
releaseRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'activity/activityRelease.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, params, db, body, address: ip, query, nkcModules} = ctx;
		const {ActivityModel, SettingModel, ActivityHistoryModel} = db;
		const {user} = data;
		const {post} = body;
		const {activityTitle, address, sponsor, limitNum, enrollStartTime, enrollEndTime, holdStartTime, holdEndTime, activityType, posterId, description, contactNum, continueTofull,conditions} = post;
		const acid = await SettingModel.operateSystemID('activitys', 1);
		const activityInfo = new ActivityModel({
			acid,
			activityTitle,
			description,
			posterId,
			address,
			sponsor,
			limitNum,
			enrollStartTime,
			enrollEndTime,
			holdStartTime,
			holdEndTime,
			activityType,
			contactNum,
			continueTofull,
			conditions,
			uid: user.uid
		});
		await activityInfo.save();
		const activityHistory = new ActivityHistoryModel({
			acid,
			activityTitle,
			description,
			posterId,
			address,
			sponsor,
			limitNum,
			enrollStartTime,
			enrollEndTime,
			holdStartTime,
			holdEndTime,
			contactNum,
			continueTofull,
			uid: user.uid
		})
		await activityHistory.save();
		// 活动申请限制，每日一次
		await next();
	});
module.exports = releaseRouter;