const Router = require('koa-router');
const router = new Router();
const financeRouter = require('./finance');
const contributeRouter = require("./contribute");
const subscribeReouter = require("./subscribes");
const subTypesRouter = require("./subscribeTypes");
const thread = require("./thread");
const post = require("./post");
router
  .use(["/", "/:t"], async (ctx, next) => {
    const {db, data, params} = ctx;
    const {user} = data;
    const {
      threadCount,
      postCount,
      draftCount
    } = user;
    data.t = params.t;
    data.subUsersId = await db.SubscribeModel.getUserSubUsersId(user.uid);
    data.subTopicsId = await db.SubscribeModel.getUserSubForumsId(user.uid, "topic");
    data.subDisciplinesId = await db.SubscribeModel.getUserSubForumsId(user.uid, "discipline");
    data.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(user.uid);
    data.subThreadsId = await db.SubscribeModel.getUserSubThreadsId(user.uid);
    data.fansId = await db.SubscribeModel.getUserFansId(user.uid);
    data.collectionThreadsId = await db.SubscribeModel.getUserCollectionThreadsId(user.uid);
    data.navLinks = [
      {
        name: "我的发表",
        links: [
          {
            type: "thread",
            url: "/account/thread",
            name: "我的文章",
            count: threadCount
          },
          {
            type: "post",
            url: "/account/post",
            name: "我的回复",
            count: postCount
          },
          {
            type: "draft",
            url: "/account/draft",
            name: "我的草稿",
            count: draftCount
          }
        ]
      },
      {
        name: "我的关注",
        links: [
          {
            type: "s-user",
            url: "/account/subscribe/user",
            name: "关注的用户",
            count: data.subUsersId.length
          },
          {
            type: "s-topic",
            url: "/account/subscribe/topic",
            name: "关注的话题",
            count: data.subTopicsId.length
          },
          {
            type: "s-discipline",
            url: "/account/subscribe/discipline",
            name: "关注的学科",
            count: data.subDisciplinesId.length
          },
          {
            type: "s-column",
            name: "关注的专栏",
            url: "/account/subscribe/column",
            count: data.subColumnsId.length
          },
          {
            type: "s-thread",
            url: "/account/subscribe/thread",
            name: "关注的文章",
            count: data.subThreadsId.length
          },
          {
            type: "collection",
            url: "/account/collection",
            name: "收藏的文章",
            count: data.collectionThreadsId.length
          }
        ]
      },
      {
        name: "其他",
        links: [
          {
            type: "finance",
            url: "/account/finance",
            name: "我的账单",
            count: await db.KcbsRecordModel.count({
              $or: [
                {
                  from: user.uid
                },
                {
                  to: user.uid
                }
              ]
            })
          },
          {
            type: "fans",
            name: "我的粉丝",
            url: "/account/follower",
            count: data.fansId.length
          }
        ]
      }
    ];
    ctx.template = "account/account.pug";
    await next();
  })
  .get("/", async (ctx, next) => {
    await next();
  })
  .get("/thread", thread)
  .get("/post", post)
  
  .use("/subscribe_types", subTypesRouter.routes(), subTypesRouter.allowedMethods())
  .use("/subscribes", subscribeReouter.routes(), subscribeReouter.allowedMethods())
  .use("/contribute", contributeRouter.routes(), contributeRouter.allowedMethods())
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods());
module.exports = router;