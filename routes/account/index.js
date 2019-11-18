const Router = require('koa-router');
const router = new Router();
const financeRouter = require('./finance');
const contributeRouter = require("./contribute");
const subscribeReouter = require("./subscribes");
const subTypesRouter = require("./subscribeTypes");
router
  .use("/", async (ctx, next) => {
    const {db, data, query} = ctx;
    const {user} = data;
    const {
      threadCount,
      postCount,
      draftCount
    } = user;
    data.t = query.t;
    data.subUsersId = await db.SubscribeModel.getUserSubUsersId(user.uid);
    data.subTopicsId = await db.SubscribeModel.getUserSubForumsId(user.uid, "topic");
    data.subDisciplinesId = await db.SubscribeModel.getUserSubForumsId(user.uid, "discipline");
    data.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(user.uid);
    data.subThreadsId = await db.SubscribeModel.getUserSubThreadsId(user.uid);
    data.collectionThreadsId = await db.SubscribeModel.getUserCollectionThreadsId(user.uid);
    data.navLinks = [
      {
        name: "我的发表",
        links: [
          {
            type: "thread",
            name: "我的文章",
            count: threadCount
          },
          {
            type: "post",
            name: "我的回复",
            count: postCount
          },
          {
            type: "draft",
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
            name: "关注的用户",
            count: data.subUsersId.length
          },
          {
            type: "s-topic",
            name: "关注的话题",
            count: data.subTopicsId.length
          },
          {
            type: "s-discipline",
            name: "关注的学科",
            count: data.subDisciplinesId.length
          },
          {
            type: "s-column",
            name: "关注的专栏",
            count: data.subColumnsId.length
          },
          {
            type: "s-thread",
            name: "关注的文章",
            count: data.subThreadsId.length
          },
          {
            type: "collection",
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
            type: "collection",
            name: "我的粉丝",
            count: await db.SubscribeModel.count({type: "user", tUid: user.uid})
          }
        ]
      }
    ];
    await next();
  })
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.userPostSummary = await db.UserModel.getUserPostSummary(user.uid);
    ctx.template = "account/account.pug";
    await next();
  })
  .use("/subscribe_types", subTypesRouter.routes(), subTypesRouter.allowedMethods())
  .use("/subscribes", subscribeReouter.routes(), subscribeReouter.allowedMethods())
  .use("/contribute", contributeRouter.routes(), contributeRouter.allowedMethods())
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods());
module.exports = router;