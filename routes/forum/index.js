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
	.post('/', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {ForumModel, UserModel, SettingModel} = db;
		const {userLevel} = data;
		const {
		  type,
      description,
      displayName,
      visibility,
      parentId,
      order,
      moderators,
      isVisibleForNCC,
      color,
      contentClass,
      abbr,
		} = body;
    if(userLevel < 6) {
      ctx.throw(403, '权限不足');
      return next()
    }
    const isDisplayNameExists = await ForumModel.findOne({displayName});
    if(isDisplayNameExists) {
      ctx.throw(422, `全名为 [${displayName}] 的板块已存在`);
      return next()
    }
		switch(type) {
      case 'category':
        body.parentId = undefined;
        break;
      case 'forum':
        if(parentId && await ForumModel.findOne({fid: parentId}))
          break;
        else {
          ctx.throw(422, `父分区 [${parentId}] 不存在或未指定`);
          return next()
        }
      default:
        ctx.throw(422, `未知分区类型 [${type}] `);
        return next()
    }
    body.class = contentClass;
		const usernames = moderators.split(',').map(name => name.toLowerCase());
    try {
      body.moderators = await Promise.all(usernames.map(async name =>
        await UserModel.findOnly({usernameLowerCase: name})
          .then(user => user.uid)
      ));
    } catch(e) {
      ctx.throw(422, '管理员中有不存在的用户名');
      return next()
    }
    body.fid = await SettingModel.operateSystemID('forums', 1);
    const newForum = new ForumModel(body);
		await newForum.save();
    return ctx.redirect(`/f/${body.fid}`, 303)
	})
  .get('/:fid', async (ctx, next) => {
    const {ForumModel, ThreadTypeModel, UserModel} = ctx.db;
    const {fid} = ctx.params;
    const {data, query} = ctx;
    const {digest, cat, sortby} = query;
    const page = query.page || 0;
    const forum = await ForumModel.findOnly({fid});
    if(!await forum.ensurePermission(ctx)) ctx.throw(403, '权限不足');
    const fidOfChildForum = await forum.getFidOfChildForum(ctx);
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
	  const {user} = data;
		if(!user.certs.includes('mobile')) ctx.throw(401, '您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
		if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发帖。');
	  const {post} = body;
    const {c, t} = post;
    if(c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
    if(t === '') ctx.throw(400, '标题不能为空！');
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
  .del('/:fid', async (ctx, next) => {
    const {params, db} = ctx;
    const {fid} = params;
    const {ThreadModel, ForumModel} = db;
    const forum = ForumModel.findOnly({fid});
    const count = await ThreadModel.count({fid});
    if(count > 0) {
      ctx.throw(422, `该板块下仍有${count}个帖子, 请转移后再删除板块`);
      return next()
    } else {
      await forum.remove()
    }
    return next()
  })
  .use('/:fid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = forumRouter;