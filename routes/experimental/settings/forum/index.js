const Router = require('koa-router');
const router = new Router();
router
	.use('/', async (ctx, next) => {
		const {db, data} = ctx;
		const allForums = await db.ForumModel.find({}).sort({order: 1});
		const forumChild = {};
		const _forums = [];
		for(const f of allForums) {
			const forum = f.toObject();
			_forums.push(forum);
			if(forumChild[forum.fid]) {
				forum.childForums = forumChild[forum.fid];
			} else {
				forum.childForums = [];
				forumChild[forum.fid] = forum.childForums;
			}
			for(const pfid of forum.parentsId) {
				if(!forumChild[pfid]) {
					forumChild[pfid] = [];
				}
				forumChild[pfid].push(forum);
			}
		}
		data.forums = _forums.filter(f => !f.parentsId.length);
		data.allForums = allForums;
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.forumSettings = await db.SettingModel.getSettings('forum');
		const certList = await db.RoleModel.getCertList();
		// 预处理一下
		const roles = [], grades = [];
		for(let cert of certList) {
			let { type, name } = cert;
			if(type.startsWith("role-")) {
				let id = type.substr(5);
				let cn = name.substr("5");
				roles.push({id, name: cn});
			} else if(type.startsWith("grade-")) {
				let id = type.substr(6);
				let cn = name.substr("5");
				grades.push({id, name: cn});
			}
		}
		data.forumCategories = await db.ForumCategoryModel.find().sort({order: 1});
		data.certs = { roles, grades };
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
		const {db, body, nkcModules, data} = ctx;
		const {allForums, forums} = data;
		const {checkString} = nkcModules.checkData;
		const {
			forumsInfo,
			categories,
			recycle,
			archive,
			selectedReviewForumCert,
			reviewNewForumGuide,
			founderGuide,
			selectedNewForumCert,
			selectedNewForumGrade,
			selectedRelationship
		} = body;
		if(!recycle) ctx.throw(400, '回收站专业ID不能为空');
		if(!archive) ctx.throw(400, '归档专业ID不能为空');
		const forum = await db.ForumModel.findOne({fid: recycle});
		const archiveForum = await db.ForumModel.findOne({fid: archive}, {fid: true});
		if(!forum) ctx.throw(400, `回收站专业不存在 fid: ${recycle}`);
		if(!archiveForum) ctx.throw(400, `归档专业不存在 fid: ${archive}`);
		if(forumsInfo.length !== allForums.length) {
			ctx.throw(400, '专业数目错误，请刷新后再试');
		}
		const forumsId = allForums.map(f => f.fid);
		for(let forum of forumsInfo) {
			if(!forumsId.includes(forum.fid)) {
				ctx.throw(400, `专业ID错误 fid: ${forum.fid}`);
			}
		}
		const forumsInfoObj = {};
		forumsInfo.map(f => forumsInfoObj[f.fid] = f);

		const updateForumInfo = async (arr) => {
			let info = [];
			for(const a of arr) {
				info.push(forumsInfoObj[a.fid]);
				if(a.childForums && a.childForums.length) {
					await updateForumInfo(a.childForums);
				}
			}
			info = info.sort((a, b) => {
				return a.order > b.order? 1: -1
			});
			for(let i = 0; i < info.length; i++) {
				const f = info[i];
				await db.ForumModel.updateOne({fid: f.fid}, {
					$set: {
						threadListStyle: {
							type: f.threadListStyle.type,
							cover: f.threadListStyle.cover
						},
						order: (i + 1) * 10
					}
				});
			}
		}

		await updateForumInfo(forums);

		const cid = [];
		if(!categories.length) ctx.throw(400, '专业分类不能为空');
		for(let i = 0; i < categories.length; i ++) {
			let {
				_id, name, description, displayStyle,
				mutuallyExclusiveWithSelf, mutuallyExclusiveWithOthers
			} = categories[i];
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
						mutuallyExclusiveWithOthers: !!mutuallyExclusiveWithOthers,
						mutuallyExclusiveWithSelf: !!mutuallyExclusiveWithSelf,
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
		// 更新归档专业ID
		await db.SettingModel.updateOne({_id: 'forum'}, {
			$set: {
				'c.archive': archive
			}
		});
		await db.ForumCategoryModel.remove({_id: {$nin: cid}});
		const forumCategories = await db.ForumCategoryModel.find();
		const forumCategoriesId = forumCategories.map(f => f._id);
		for(let i = 0; i < forumCategories.length; i++) {
			const fc = forumCategories[i];
			const {
				mutuallyExclusiveWithSelf,
				mutuallyExclusiveWithOthers
			} = fc;
			let excludedCategoriesId = [];
			// 与自己互斥
			if(mutuallyExclusiveWithSelf) {
				excludedCategoriesId.push(fc._id);
			}
			// 与其他专业互斥
			if(mutuallyExclusiveWithOthers) {
				const arr = forumCategoriesId.concat([]);
				arr.splice(i, 1);
				excludedCategoriesId = excludedCategoriesId.concat(arr);
			}
			// 其他专业与当前专业互斥
			for(const f of forumCategories) {
				if(f === fc || !f.mutuallyExclusiveWithOthers) continue;
				excludedCategoriesId.push(f._id);
			}

			excludedCategoriesId = [...new Set(excludedCategoriesId)];
			await fc.update({excludedCategoriesId});
		}

		await db.SettingModel.updateOne({_id: 'forum'}, {
			$set: {
				'c.reviewNewForumCert': selectedReviewForumCert || [],
				'c.reviewNewForumGuide': reviewNewForumGuide || "",
				'c.founderGuide': founderGuide || "",
				'c.openNewForumCert': selectedNewForumCert || [],
        'c.openNewForumGrade': selectedNewForumGrade || [],
        'c.openNewForumRelationship': selectedRelationship || "or"
			}
		});

		await db.SettingModel.saveSettingsToRedis("forum");
		await db.ForumCategoryModel.saveCategoryToRedis();
		await next();
	});
module.exports = router;
