const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;

threadRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {from, keywords, applicationFormId, self} = query;
		if(from === 'applicationForm') {
			const outPostObj = (post) => {
				return {
					toc: post.toc.toLocaleString(),
					tid: post.tid,
					username: post.user.username,
					uid: post.uid,
					t: post.t,
					pid: post.pid
				}
			};
			const perpage = (page, length) => {
				const perpage = 20;
				const start = perpage*page;
				return {
					page,
					start,
					perpage,
					pageCount: Math.ceil(length/perpage)
				}
			};
			const page = query.page? parseInt(query.page): 0;
			data.paging = {page: 0, pageCount: 1, perpage: 8};
			const threads = [];
			let targetThreads = [];
			if(self === 'true') {
				const length = await db.ThreadModel.count({uid: user.uid, disabled: false});
				const paging= perpage(page, length);
				targetThreads = await db.ThreadModel.find({uid: user.uid, disabled: false}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
				data.paging = paging;
			} else {
				const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId});
				const users = await applicationForm.extendMembers();
				const usersId = users.map(u => u.uid);
				usersId.push(user.uid);
				const post = await db.PostModel.findOne({pid: keywords, uid: {$in: usersId}, disabled: false});
				if(post !== null) {
					await post.extendThread();
					if(post.pid === post.thread.oc) {
						await post.extendUser();
						threads.push(outPostObj(post));
					}
				}
				const targetUser = await db.UserModel.findOne({usernameLowerCase: keywords.toLowerCase()});
				if(targetUser !== null && usersId.includes(targetUser.uid)) {
					const length = await db.ThreadModel.count({uid: targetUser.uid, disabled: false});
					const paging = perpage(page, length);
					targetThreads = await db.ThreadModel.find({uid: targetUser.uid, disabled: false}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
					data.paging = paging;
				}
			}
			await Promise.all(targetThreads.map(async t => {
				const post = await t.extendFirstPost();
				await post.extendUser();
				threads.push(outPostObj(post));
			}));
			data.threads = threads;
		}
		await next();
	})
  .get('/:tid', async (ctx, next) => {
	  const {data, params, db, query} = ctx;
    let {page = 0, pid, last_page, highlight} = query;
    const {tid} = params;
    const {
      ThreadModel,
      PersonalForumModel,
      SettingModel,
      ForumModel,
      PostModel
    } = db;
    const thread = await ThreadModel.findOnly({tid});
    if(!await thread.ensurePermission(ctx)) ctx.throw(401, '权限不足');
    let q = {
      tid: tid
    };
    data.highlight = highlight;
    if(!await thread.ensurePermissionOfModerators(ctx)) q.disabled = false;
    data.paging = apiFn.paging(page, thread.count);
    const forum = await ForumModel.findOnly({fid: thread.fid});
    const {mid, toMid} = thread;
    data.forumList = await dbFn.getAvailableForums(ctx);
    if(data.user) {
      data.usersThreads = await data.user.getUsersThreads();
    }
    data.ads = (await SettingModel.findOnly({uid: 'system'})).ads;
    let myForum, othersForum;
    if(mid !== '') {
      myForum = await PersonalForumModel.findOnly({uid: mid});
      data.myForum = myForum
    }
    if(toMid !== '') {
      othersForum = await PersonalForumModel.findOnly({uid: toMid});
      data.othersForum = othersForum
    }
    data.targetUser = await thread.extendUser();
    await thread.update({$inc: {hits: 1}});
    data.thread = thread;
    data.forum = forum;
    data.replyTarget = `t/${tid}`;
    ctx.template = 'interface_thread.pug';
    let posts;
    if(pid) {
      const matchBase = ctx.generateMatchBase({pid}).toJS();
      const {page, step} = await thread.getStep(matchBase);
      return ctx.redirect(`/t/${tid}?&page=${page}&highlight=${pid}#${pid}`, 301)
    } else if(last_page) {
      query.page = data.paging.pageCount - 1;
      data.paging.page = data.paging.pageCount - 1;
      posts = await thread.getPostByQuery(query, q);
    } else {
      posts = await thread.getPostByQuery(query, q);
    }
    await Promise.all(posts.map(async post => {
      const postContent = post.c || '';
      const index = postContent.indexOf('[quote=');
      if(index !== -1) {
        const targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));
        let {page, step} = await thread.getStep({pid: targetPid, disabled: q.disabled});
        page = `?page=${page}`;
        const postLink = `/t/${tid + page}`;
        post.c = postContent.replace(/=/,`=${postLink},${step},`);
      }
    }));
    data.posts = posts;
    await thread.extendFirstPost().then(p => p.extendUser());
    await thread.extendLastPost();
    await next();
  })
  .post('/:tid', async (ctx, next) => {
    const {
      data, params, db, body, ip,
      generateUsersBehavior
    } = ctx;
    const {user} = data;
    const {tid} = params;
    const {
      ThreadModel,
    } = db;
    const {post} = body;
    if(post.c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
    const thread = await ThreadModel.findOnly({tid});
    const _post = await thread.newPost(post, user, ip);
    data.targetUser = await thread.extendUser();
    await generateUsersBehavior({
      operation: 'postToThread',
      pid: _post.pid,
      tid: thread.tid,
      fid: thread.fid,
      mid: thread.mid,
      toMid: thread.toMid,
    });
    await thread.update({$inc: [{count: 1}, {hits: 1}]});
    const type = ctx.request.accepts('json', 'html');
    await thread.updateThreadMessage();
    await user.updateUserMessage();
    if(type === 'html')
      ctx.redirect(`/t/${tid}`, 303);
    data.post = _post;
    data.redirect = `/t/${thread.tid}?&pid=${_post.pid}`;
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
