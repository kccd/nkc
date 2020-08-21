const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.forums = await db.ForumModel.find({parentsId: []}).sort({order: 1});
		data.forumSettings = await db.SettingModel.getSettings('forum');
		data.forumCategories = await db.ForumCategoryModel.find().sort({order: 1});
		data.type = 'forum';
		ctx.template = 'experimental/settings/forum/forum.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {db} = ctx;
		await db.ForumModel.updateForumsMessage();
		await next();
	})
	.put('/', async (ctx, next) => {
		const {db, body, nkcModules} = ctx;
		const {checkString} = nkcModules.checkData;
		const {fidArr, categories, recycle} = body;
		const forums = await db.ForumModel.find({parentsId: []}).sort({order: 1});
		if(!recycle) ctx.throw(400, '回收站专业ID不能为空');
		const forum = await db.ForumModel.findOne({fid: recycle});
		if(!forum) ctx.throw(400, `回收站专业不存在 fid: ${recycle}`);
		if(fidArr.length !== forums.length) {
			ctx.throw(400, '参数错误');
		}
		for(let forum of forums) {
			if(!fidArr.includes(forum.fid)) {
				ctx.throw(400, '参数错误');
			}
		}
		for(let forum of forums) {
			const order = fidArr.indexOf(forum.fid) + 1;
			await forum.update({order});
		}
		const cid = [];
		if(!categories.length) ctx.throw(400, '专业分类不能为空');
		for(let i = 0; i < categories.length; i ++) {
			let {_id, name, description, displayStyle} = categories[i];
			checkString(name, {
				name: '分类名',
				minLength: 1,
				maxLength: 20
			});
			checkString(description, {
				name: '分类介绍',
				minLength: 0,
				maxLength: 100
			});
			if(!['simple', 'detailed', 'normal'].includes(displayStyle)) {
				ctx.throw(400, `专业显示风格错误`);
			}
			if(_id !== undefined) {
				// 已存在
				await db.ForumCategoryModel.updateOne({_id}, {
					$set: {
						name,
						description,
						displayStyle,
						order: i
					}
				});
			} else {
				_id = await db.SettingModel.operateSystemID('forumCategories', 1);
				const c = db.ForumCategoryModel({
					_id,
					name,
					displayStyle,
					description,
					order: i
				});
				await c.save();
			}
			cid.push(_id);
		}
		await db.ForumModel.updateMany({categoryId: {$nin: cid}}, {
			$set: {
				categoryId: cid[0]
			}
		});
		const recycleId = await db.SettingModel.getRecycleId();
		if(recycleId !== recycle) {
			await db.SettingModel.updateOne({_id: 'forum'}, {
				$set: {
					'c.recycle': recycle
				}
			});
		}
		await db.ForumCategoryModel.remove({_id: {$nin: cid}});
		await db.SettingModel.saveSettingsToRedis("forum");
		await db.ForumCategoryModel.saveCategoryToRedis();
		await next();
	});
module.exports = router;
