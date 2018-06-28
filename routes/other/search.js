const Router = require('koa-router');
const {replaceChineseToCharRef} = require('../../tools').checkString;

const router = new Router();

router.get('/', async(ctx, next) => {
  ctx.template = 'interface_localSearch.pug';
  const {data, es, settings, query, db} = ctx;
  const {apiFunction} = ctx.nkcModules;
  let {q = '', type = 'content', page = 0} = query;
  q = q.trim();
  const {perpage} = settings.paging;
  const {searchPost, searchUser} = es;
  data.type = type;
  data.q = q;
  data.page = page;
  data.queryToCharRef = replaceChineseToCharRef(q);
  if(type === 'content') {
    const {PostModel} = db;
    // const accessibleFid = await ctx.getThreadListFid();
		// 拿到用户等级
		const gradeId = data.userGrade._id;
		// 拿到用户的角色
		const rolesId = data.userRoles.map(r => r._id);
    const options = {
			gradeId,
			rolesId,
			uid: data.user?data.user.uid: ''
    };
    // 获取用户可以访问的板块
    const accessibleFid = await db.ForumModel.fidOfCanGetThreads(options);
    // console.log(accessibleFid)
    const searchResult = await searchPost(q, page, perpage);
    data.paging = apiFunction.paging(page, searchResult.hits.total);
    data.result = await Promise.all(searchResult.hits.hits.map(async r => {
      const pid = r._id;
      try {
        const post = await PostModel.findOnly({pid, fid: {$in: accessibleFid}});
        post.t = r.highlight? r.highlight.t: r.t;
        await post.extendUser();
        await post.extendThread();
        await post.thread.extendFirstPost();
        await post.thread.extendForum();
        if(accessibleFid.includes(post.thread.fid)){
          return post
        }else{
          return null
        }
      } catch(e) {
        return null
      }
    }));
    // console.log(data.result)
    // console.log(searchResult)
    // console.log(data.result.length)
    // console.log(searchResult.hits.hits.length)
    return next()
  } else if(type === 'user') {
    const {UserModel} = db;
    const searchResult = await searchUser(q, page, perpage);
    data.result = [];
    for(const u of searchResult.hits.hits) {
      const user = await UserModel.findOnly({uid: u._id});
      user.username = u.highlight.username || user.username;
      data.result.push(user)
    }
    data.paging = apiFunction.paging(page, searchResult.hits.total);
    return next()
  }
  ctx.throw(404, 'unknown type..')
});

module.exports = router;