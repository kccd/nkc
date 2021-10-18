const router = require('koa-router')();
const ffmpeg = require('../../../tools/ffmpeg');
const FILE = require("../../../nkcModules/file");
router
  .get('/', async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
    const {page = 0, t, c = ''} = query;
    const [searchType, searchContent] = c.split(',');
    let match = {};
    if(t) {
      match.mediaType = t;
    }
    if(searchType === 'uid') {
      match.uid = searchContent;
    } else if(searchType === 'username') {
      const targetUser = await db.UserModel.findOne({usernameLowerCase: searchContent.toLowerCase()});
      match.uid = targetUser? targetUser.uid: '';
    } else if(searchType === 'rid') {
      match.rid = searchContent;
    } else if(searchType === 'pid') {
      match.references = searchContent;
    }else if(searchType === 'tid') {
      let pids = [];
      const posts =  await db.PostModel.find({tid: searchContent});
      for(const post of posts){
        pids.push(post.pid);
      }
      match.references = pids;
    }
    const count = await db.ResourceModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    let resources_;
    if(searchType === 'tid'){
      resources_ = await db.ResourceModel.find({references:{$in: match.references}}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    }else {
      resources_ = await db.ResourceModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    }
    const resources = [];
    let postsId = [];
    const usersId = [];
    for(const r of resources_) {
      await r.setFileExist([]);
      await r.setMetadata(r);
      let filePath;
      try{
        filePath = await r.getFilePath();
      } catch(err) {}
      const resource = r.toObject();
      resource.filePath = filePath;
      const {references} = resource;
      postsId = postsId.concat(references);
      resources.push(resource);
      usersId.push(r.uid);
    }
    const posts = await db.PostModel.find({pid: {$in: postsId}});
    const postsObj = {};
    for(const post of posts) {
      postsObj[post.pid] = post;
    }
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const usersObj = {};
    for(const u of users) {
      usersObj[u.uid] = u;
    }
    for(const r of resources) {
      const {references} = r;
      const targets = [];
      r.user = usersObj[r.uid];
      r.mediaTypeName = ctx.state.lang('resourceMediaTypes', r.mediaType);
      for(const pid of references) {
        const post = postsObj[pid];
        if(!post) continue;
        let type, title, url = nkcModules.tools.getUrl(`post`, post.pid);
        if(post.type === 'thread') {
          type = 'thread';
          title = post.t;
        } else {
          const firstPost = await db.PostModel.findOne({tid: post.tid}).sort({toc: 1});
          type = 'post';
          title = firstPost.t;
        }
        targets.push({
          type, title, url
        });
      }
      r.targets = targets;
    }
    data.paging = paging;
    data.resources = resources;
    data.t = t;
    data.c = c;
    data.searchType = searchType;
    data.searchContent = searchContent;
    ctx.template = 'experimental/log/resource.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {query, db, data, nkcModules, body} = ctx;
    const {rid} = body;
    const resource = await db.ResourceModel.findOne({rid: rid});
    //获取文件信息
    const filePath = await resource.getFilePath(resource);
    //判断路劲文件是否存在,如果不存在就返回错误
    if(!await FILE.access(filePath)) return ctx.throw(400, `文件已丢失`);
    await resource.removeResourceInfo(resource);
    await next();
  });
module.exports = router;
