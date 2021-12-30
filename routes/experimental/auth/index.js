const Router = require('koa-router');
const authDetailRouter = require("./[uid]");
const authRouter = new Router();

authRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, params} = ctx;
		const {c = ''} = query;
		//  中英文逗号都能分割
		const [searchType, searchContent] = c.split(/[\n\s+,，]/g);
		let userPersonalArr = '';
		data.searchType = searchType;
		data.searchContent = searchContent;
		if(c) {
			//获取搜索内容
			if(searchType === 'username') {
				let user = '';
				user = await db.UserModel.findOne({usernameLowerCase: searchContent.toLowerCase()});
				if(!user) {
          userPersonalArr = [];
        } else {
          userPersonalArr = await db.UsersPersonalModel.find({uid: user.uid});
        }
			} else if(searchType === 'uid') {
				userPersonalArr = await db.UsersPersonalModel.find({uid: searchContent});
			}
		} else {
			//获取身份认证待审核的认证信息
			const count = await db.UsersPersonalModel.countDocuments({
				$or: [
					{"authenticate.card.status": "in_review"},
					{"authenticate.video.status": "in_review"}
				]
			});
			userPersonalArr = await db.UsersPersonalModel.find({
				$or: [
					{"authenticate.card.status": "in_review"},
					{"authenticate.video.status": "in_review"}
				]
			}).sort({_id: 1});
		}
		data.usersAuth = await Promise.all(userPersonalArr.map(async user => {
			let authLevel = 2;
			if(user.authenticate.video.status === "in_review") {
				authLevel = 3;
			}
			if(user.authenticate.card.status === "in_review") {
				authLevel = 2;
			}
			const targetUser = await db.UserModel.findOne({uid: user.uid}, { uid: true, username: true });
			return {
				authLevel,
				targetUser
			}
		}));
		ctx.template = '/experimental/auth/index.pug';
		await next();
	})
	.use("/:uid", authDetailRouter.routes(), authDetailRouter.allowedMethods());
module.exports = authRouter;