const Router = require('koa-router');
const infoRouter = new Router();

infoRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'forum/settings/info.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body, nkcModules} = ctx;
		const {forum} = data;
		if(body.operation) {
			const {did, declare} = body;
			// 富文本内容中每一个source添加引用
			await db.ResourceModel.toReferenceSource("forum-" + forum.fid, declare);
			// if(!declare) ctx.throw(400, '专业说明不能为空');
			await forum.update({declare});
			if(did) {
				await db.DraftModel.removeDraftById(did, data.user.uid);
			}
			data.redirect = `/f/${forum.fid}/home`;
			return await next();
		}
		const {checkString} = nkcModules.checkData;

		let {
			displayName, abbr, color,
			description, noticeThreadsId,
			brief, basicThreadsId, valuableThreadsId
		} = JSON.parse(body.fields.forum);


		const logoFile = body.files.logo;
		const bannerFile = body.files.banner;

		checkString(displayName, {
			name: '专业名称',
			minLength: 1,
			maxLength: 30
		});
		let sameName = await db.ForumModel.count({fid: {$ne: forum.fid}, displayName});
		if(sameName) ctx.throw(400, "专业名称已存在");
		checkString(abbr, {
			name: '专业简称',
			minLength: 1,
		});
		sameName = await db.ForumModel.count({fid: {$ne: forum.fid}, abbr});
		if(sameName) ctx.throw(400, "专业简称已存在");
		checkString(brief, {
			name: '专业简介',
			minLength: 0,
			maxLength: 40
		});
		checkString(description, {
			name: '专业介绍',
			minLength: 1,
			maxLength: 1000
		});
		const posts = await db.PostModel.find({pid: {$in: [].concat(basicThreadsId).concat(valuableThreadsId).concat(noticeThreadsId)}}, {pid: 1});
		const postsId = posts.map(p => p.pid);
		basicThreadsId = basicThreadsId.filter(b => postsId.includes(b));
		valuableThreadsId = valuableThreadsId.filter(b => postsId.includes(b));
		noticeThreadsId = noticeThreadsId.filter(b => postsId.includes(b));

		await forum.update({
			displayName, abbr, color, description,
			brief,
			basicThreadsId,
			valuableThreadsId,
			noticeThreadsId
		});

		if(logoFile) {
			logoFile.name = `${Date.now()}.png`;
			data.logo = (await db.AttachmentModel.saveForumImage(forum.fid, 'forumLogo', logoFile))._id;
		}
		if(bannerFile) {
			bannerFile.name = `${Date.now()}.png`;
			data.banner = (await db.AttachmentModel.saveForumImage(forum.fid, 'forumBanner', bannerFile))._id;
		}

		if(forum.lid) {
			await db.LibraryModel.updateOne({
				_id: forum.lid
			}, {
				$set: {
					name: displayName,
					description
				}
			});
		}
		await next();
	});


module.exports = infoRouter;
