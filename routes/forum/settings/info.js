const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_forum_settings_info.pug';

		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {forum} = data;
		let {did, operation, declare, displayName, abbr, color, description, noticeThreadsId, brief, basicThreadsId, valuableThreadsId} = body;
		if(operation && operation === 'updateDeclare') {
			// if(!declare) ctx.throw(400, '专业说明不能为空');
			await forum.update({declare});
			if(did) {
			  await db.DraftModel.remove({did, uid: data.user.uid});
      }
			data.redirect = `/f/${forum.fid}/home`;
		} else {
			if(brief.length > 15) ctx.throw(400, "专业简介不能超过15个字");
			if(!displayName) ctx.throw(400, '专业名称不能为空');
			if(!abbr) ctx.throw(400, '专业简称不能为空');
			// if(!brief) ctx.throw(400, '专业简介不能为空');
			if(brief.length > 15) ctx.throw(400, '专业简介不能超过15个字');

			const sameAbbrForum = await db.ForumModel.findOne({abbr});
			if(sameAbbrForum && sameAbbrForum.fid !== forum.fid) ctx.throw(400, '专业简称已存在');

			// if(!description) ctx.throw(400, '专业介绍不能为空');

			let basicThreadsId_ = [], valuableThreadsId_ = [], noticeThreadsId_ = [];
			await Promise.all(basicThreadsId.split(',').map(async pid => {
				pid = pid.trim();
				const thread = await db.ThreadModel.findOne({oc: pid});
				if(thread) basicThreadsId_.push(pid);
			}));

			await Promise.all(valuableThreadsId.split(',').map(async pid => {
				pid = pid.trim();
				const thread = await db.ThreadModel.findOne({oc: pid});
				if(thread) valuableThreadsId_.push(pid);
			}));

			await Promise.all(noticeThreadsId.split(',').map(async pid => {
				pid = pid.trim();
				const thread = await db.ThreadModel.findOne({oc: pid});
				if(thread) noticeThreadsId_.push(pid);
			}));
			await forum.update({displayName, abbr, color, description, brief, basicThreadsId: basicThreadsId_, valuableThreadsId: valuableThreadsId_, noticeThreadsId: noticeThreadsId_});
		}
		await next();
	});
module.exports = infoRouter;