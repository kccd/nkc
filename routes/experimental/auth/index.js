const Router = require('koa-router');
const authDetailRouter = require("./[uid]");
const authRouter = new Router();

authRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, params, nkcModules} = ctx;
		const {c = '', type, page=0} = query;
		const authMap = {
			passed: "通过",
			unsubmit: '未提交',
			in_review: '审核中',
			fail: '未通过'
		}
		const matchMap = {
			auth1: {
				mobile: { $ne: '' }
			},
			auth2: {
				'authenticate.card.status': 'passed'
			},
			auth3: {
				'authenticate.video.status': 'passed'
			},
			'waiting-review': {
				'$or': [
					{"authenticate.card.status": "in_review"},
					{"authenticate.video.status": "in_review"}
				]
			}
		}
		const match = {};
		if (type) {
			if (type.includes('auth')) {
				const delimiter = ','
				const arr = type.split(delimiter);
				const part1 = arr[0];
				const part2 = arr[1].includes('-') ? arr[1].split('-').map(s => part1 + s) : [part1 + arr[1]];
				part2.forEach(item => {
					const keys = Object.keys(matchMap[item])
					keys.forEach(key => {
						match[key] = matchMap[item][key]
					})
				})
			} else if (type === 'waiting-review') {
				match['$or'] = matchMap['waiting-review'].$or
			}
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
			const count = await db.MomentModel.countDocuments(match);
			const paging = await nkcModules.apiFunction.paging(page, count, 10);
			data.paging = paging;
			userPersonalArr = await db.UsersPersonalModel.find(match).sort({_id: 1}).skip(paging.start).limit(paging.perpage);
		}
		
		data.usersAuth = await Promise.all(userPersonalArr.map(async user => {
			let authLevel = 2;
			if(user.authenticate.video.status === "in_review") {
				authLevel = 3;
			}
			if(user.authenticate.card.status === "in_review") {
				authLevel = 2;
			}
			const reviewAuth2User = await db.UserModel.findOne({uid: user.authenticate.card.reviewer}, { uid: true, username: true });
			const targetUser = await db.UserModel.findOne({uid: user.uid}, { uid: true, username: true });
			let reviewAuth3User;
			if (user.authenticate.card.reviewer === user.authenticate.video.reviewer) {
				reviewAuth3User = reviewAuth2User;
			} else {
				reviewAuth3User = await db.UserModel.findOne({uid: user.authenticate.video.reviewer}, { uid: true, username: true });
			}
			return {
				auth1: {
					status: !!user.mobile ? '通过' : '未通过',
				},
				auth2: {
					status: authMap[user.authenticate.card.status],
					expiryDate: nkcModules.tools.timeFormat(user.authenticate.card.expiryDate),
					reviewDate: nkcModules.tools.timeFormat(user.authenticate.card.reviewDate),
					reviewer: reviewAuth2User || {uid: '', name: ''}
				},
				auth3: {
					status: authMap[user.authenticate.video.status],
					expiryDate: nkcModules.tools.timeFormat(user.authenticate.video.expiryDate),
					reviewDate: nkcModules.tools.timeFormat(user.authenticate.video.reviewDate),
					reviewer: reviewAuth3User || {uid: '', name: ''}
				},
				authLevel,
				targetUser
			}
		}));
		ctx.template = 'experimental/auth/index.pug';
		await next();
	})
	.use("/:uid", authDetailRouter.routes(), authDetailRouter.allowedMethods());
module.exports = authRouter;
