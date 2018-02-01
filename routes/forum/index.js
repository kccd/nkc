const Router = require('koa-router');
const operationRouter = require('./operation');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;
const forumRouter = new Router();

forumRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		const {user} = data;
		data.forums = await dbFn.getAvailableForums(ctx);
		ctx.template = 'interface_forums.pug';
		data.uid = user? user.uid: undefined;
		data.navbar = {highlight: 'forums'};
		await next();
	})
	.get('/:fid', async (ctx, next) => {
		const {ForumModel, ThreadTypeModel, UserModel} = ctx.db;
		const {fid} = ctx.params;
		const {data, query} = ctx;
		const {digest, cat, sortby} = query;
		const page = query.page || 0;
		const visibleFid = await ctx.getVisibleFid();
		const forum = await ForumModel.findOnly({fid});
		if(!forum.ensurePermission(visibleFid)) ctx.throw(401, '权限不足');
		const fidOfChildForum = await forum.getFidOfChildForum(visibleFid);
		let q = {
			fid: {$in: fidOfChildForum}
		};
		if(cat) {
			q.cid = cat;
			data._cid = cat
		}
		if(digest) {
			q.digest = true;
			data.digest = true;
		}
		const countOfThread = await forum.getThreadCountByQuery(q);
		const paging = apiFn.paging(page, countOfThread);
		data.cat = cat;
		data.sortby = sortby;
		data.paging = paging;
		data.forum = forum;
		if(forum.moderators.length > 0) data.moderators = await UserModel.find({uid: {$in: forum.moderators}});
		let threads = await forum.getThreadsByQuery(query, q);
		let toppedThreads = [];
		if(data.paging.page === 0 && data.forum.type === 'forum') {
			toppedThreads = await forum.getToppedThreads(fidOfChildForum);
		}
		const forumList = await dbFn.getAvailableForums(ctx);
		data.toppedThreads = toppedThreads;
		data.threads = threads;
		data.forumList = forumList;
		data.forums = [];
		for (let i = 0; i < forumList.length; i++) {
			if(forumList[i].fid === fid) {
				data.forums = forumList[i].children;
				break;
			}
		}
		data.replyTarget = `f/${fid}`;
		const thredTypes = await ThreadTypeModel.find().sort({order: 1});
		let forumThreadTypes = [];
		for (let i = 0; i < thredTypes.length; i++) {
			if(thredTypes[i].fid === fid) forumThreadTypes.push(thredTypes[i]);
		}
		data.threadTypes = thredTypes;
		data.forumThreadTypes = forumThreadTypes;
		data.fTarget = fid;
		if(data.user) {
			data.userThreads = await data.user.getUsersThreads();
		}
		ctx.template = 'interface_forum.pug';
		await next();
	})
	.post('/:fid', async (ctx, next) => {
		const {
			data, params, db, body, address: ip, query,
			generateUsersBehavior
		} = ctx;
		const {post} = body;
		const {c, t} = post;
		if(c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
		if(t === '') ctx.throw(400, '标题不能为空！');
		const {user} = data;
		const {fid} = params;
		const {cat, mid} = post;
		const {
			ForumModel,
			ThreadModel
		} = db;
		const forum = await ForumModel.findOnly({fid});
		const _post = await forum.newPost(post, user, ip, cat, mid);
		await generateUsersBehavior({
			operation: 'postToForum',
			pid: _post.pid,
			tid: _post.tid,
			fid: forum.fid,
			mid: user.uid,
			toMid: user.uid,
		});
		const type = ctx.request.accepts('json', 'html');
		await forum.update({$inc: {'tCount.normal': 1}});
		const thread = await ThreadModel.findOnly({tid: _post.tid});
		await thread.updateThreadMessage();
		if(type === 'html') {
			ctx.status = 303;
			return ctx.redirect(`/t/${_post.tid}`);
		}
		data.redirect = `/t/${_post.tid}?&pid=${_post.pid}`;
		data.post = _post;
		await next();
	})
	.use('/:fid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = forumRouter;