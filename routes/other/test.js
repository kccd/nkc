const testRouter = require('koa-router')();
testRouter
  .get('/', async (ctx, next) => {
    ctx.template = "test/test.pug";
    /*const result = await ctx.db.UserModel.find({toc: {$gte: new Date('2021-01-01 00:00:00')}}).limit(10000).sort({toc: -1}).explain();
    console.log(result)*/
    // console.log(result.executionStats.executionTimeMillis, 'ms');
    await next();
  })
  .get("/demo", async (ctx, next) => {
    const {db, data} = ctx;
    const tools = ctx.nkcModules.tools;
    const posts = await db.PostModel.find({type: 'thread'}).sort({toc: -1}).limit(100);
    data.articlesData = [];
    for(const post of posts) {
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      const user = await db.UserModel.findOne({uid: thread.uid});
      const lastPost = await db.PostModel.findOne({tid: post.tid}).sort({toc: -1});
      let reply = null;
      if(lastPost) {
        const lastUser = await db.UserModel.findOne({uid: lastPost.uid});
        reply = {
          user: {
            uid: lastUser.uid,
            avatarUrl: tools.getUrl('userAvatar', lastUser.avatar),
            homeUrl: tools.getUrl('userHome', lastUser.uid),
            username: lastUser.username
          },
          content: {
            time: lastPost.toc,
            url: tools.getUrl('post', lastPost.pid),
            abstract: ctx.nkcModules.nkcRender.htmlToPlain(lastPost.c, 200),
          }
        }
      }
      data.articlesData.push({
        type: 'post',
        id: post.pid,
        user: {
          uid: user.uid,
          avatarUrl: tools.getUrl('userAvatar', user.avatar),
          homeUrl: tools.getUrl('userHome', user.uid),
          username: user.username,
        },
        categories: [
          {
            type: 'forum',
            id: '23',
            name: '分类标题',
            url: '/f/23'
          }
        ],
        pages: [
          {
            name: 2,
            url: '/f/23?page=1'
          },
          {
            name: '..',
          },
          {
            name: 3,
            url: '/f/23?page=2'
          },
          {
            name: 4,
            url: '/f/23?page=2'
          }
        ],
        status: {
          type: ['disabled', 'warning', 'danger', 'normal'][Math.round(Math.random() * 3)],
          desc: '测试状态显示'
        },
        content: {
          time: post.toc,
          coverUrl: tools.getUrl('postCover', post.cover),
          title: post.t,
          digest: post.digest,
          url: tools.getUrl('thread', thread.tid),
          abstract: ctx.nkcModules.nkcRender.htmlToPlain(post.c, 200),
          readCount: thread.hits,
          voteUpCount: thread.voteUp,
          replyCount: thread.count,
        },
        reply,
      })
    }
    ctx.template = "test/demo.pug";
    await next();
  })
  .get('/file', async (ctx, next) => {
    ctx.remoteFile = {
      url: 'http://192.168.11.250:10292',
      query: {
        time: new Date(`2021-11-10 00:00:00`),
        path: 'resource/video/2021/11/29486.mp4'
      },
      isAttachment: false,
      filename: 'success.mp4',
    };
    await next();
  });

module.exports = testRouter;
