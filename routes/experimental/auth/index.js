const Router = require('koa-router');
const authDetailRouter = require("./[uid]");
const authRouter = new Router();

authRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, params} = ctx;
		const {c = '', type} = query;
		const match = {};
		// 默认全选
		if (type === 'auth1-2') {
			match['mobile'] = {
				$ne: ''
			};
			match['authenticate.card.status'] = 'passed';
			//	只选择通过身份认证1
		} else if (type === 'auth1') {
			match['mobile'] = {
				$ne: ''
			};
			//	只选择通过身份认证2
		} else if (type === 'auth2') {
			match['authenticate.card.status'] = 'passed';
		} else if (type ==='waiting-review') {
			match['$or'] = [
				{"authenticate.card.status": "in_review"},
				{"authenticate.video.status": "in_review"}
			]
		}
		//  中英文逗号都能分割
		const [searchType, searchContent] = c.split(/[\n\s+,，]/g);
		let userPersonalArr = '';
		data.searchType = searchType;
		data.searchContent = searchContent;
		if(searchType && searchContent) {
			//获取搜索内容
			if(searchType === 'username') {
				let user = '';
				user = await db.UserModel.findOne({usernameLowerCase: searchContent.toLowerCase()});
				if(!user) {
          userPersonalArr = [];
        } else {
          userPersonalArr = await db.UsersPersonalModel.find({uid: user.uid, ...match});
        }
			} else if(searchType === 'uid') {
				userPersonalArr = await db.UsersPersonalModel.find({uid: searchContent, ...match});
			}
		} else {
			userPersonalArr = await db.UsersPersonalModel.find(match).sort({_id: 1}).skip(1).limit(13);
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
		ctx.template = 'experimental/auth/index.pug';
		await next();
	})
	.use("/:uid", authDetailRouter.routes(), authDetailRouter.allowedMethods());
module.exports = authRouter;
