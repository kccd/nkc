const Router = require("koa-router");
const router = new Router();

router
.get('/', async (ctx, next) => {
  //获取用户个人主页链接
  const {db, data, state, params} = ctx;
  const {uid} = params;
  const {targetUser} = data;
  const {
    threadCount,
    postCount,
    draftCount,
  } = targetUser;
  const noteCount = await db.NoteContentModel.countDocuments({
    uid: targetUser.uid,
    deleted: false,
  });
  const {uid: targetUid} = state;
  if(uid !== targetUid) ctx.throw(401, '权限不足');
  if(state.isApp) {
    data.appLinks = [
      {
        type: "thread",
        url: `/u/${targetUser.uid}/profile/thread`,
        name: "我的文章",
      },
      {
        type: "post",
        url: `/u/${targetUser.uid}/profile/post`,
        name: "我的回复",
      },
      {
        type: "draft",
        url: `/u/${targetUser.uid}/profile/draft`,
        name: "我的草稿",
      },
      {
        type: "note",
        name: "我的笔记",
        url: `/u/${targetUser.uid}/profile/note`,
      },
      {
        type: "subscribe/user",
        url: `/u/${targetUser.uid}/profile/subscribe/user`,
        name: "关注的用户",
      },
      {
        type: "subscribe/forum",
        url: `/u/${targetUser.uid}/profile/subscribe/forum`,
        name: "关注的专业",
      },
      /*{
        type: "subscribe/topic",
        url: `/u/${targetUser.uid}/profile/subscribe/topic`,
        name: "关注的话题",
      },
      {
        type: "subscribe/discipline",
        url: `/u/${targetUser.uid}/profile/subscribe/discipline`,
        name: "关注的学科",
      },*/
      {
        type: "subscribe/column",
        name: "关注的专栏",
        url: `/u/${targetUser.uid}/profile/subscribe/column`,
      },
      {
        type: "subscribe/thread",
        url: `/u/${targetUser.uid}/profile/subscribe/thread`,
        name: "关注的文章",
      },
      {
        type: "subscribe/collection",
        url: `/u/${targetUser.uid}/profile/subscribe/collection`,
        name: "收藏的文章",
      },
      {
        type: "finance",
        url: `/u/${targetUser.uid}/profile/finance?t=all`,
        name: "我的账单",
      },
      {
        type: "follower",
        name: "我的粉丝",
        url: `/u/${targetUser.uid}/profile/follower`,
      },
      {
        type: 'blacklist',
        name: '黑名单',
        url: `/u/${targetUser.uid}/profile/blacklist`,
      }
    ];
    data.name = "";
    data.appLinks.map(link => {
      if (data.type === link.type) data.name = link.name;
    });
  } else {
    data.navLinks = [
      {
        name: "",
        links: [
          {
            type: "",
            url: `/u/${targetUser.uid}/profile`,
            name: "数据概览",
            count: 0
          }
        ]
      },
      {
        name: "我的作品",
        links: [
          {
            type: "thread",
            url: `/u/${targetUser.uid}/profile/thread`,
            name: "我的文章",
            count: threadCount
          },
          {
            type: "post",
            url: `/u/${targetUser.uid}/profile/post`,
            name: "我的回复",
            count: postCount
          },
          {
            type: "draft",
            url: `/u/${targetUser.uid}/profile/draft`,
            name: "我的草稿",
            count: draftCount
          },
          {
            type: "note",
            url: `/u/${targetUser.uid}/profile/note`,
            name: "我的笔记",
            count: noteCount
          }
        ]
      },
      {
        name: "我的关注",
        links: [
          {
            type: "subscribe/user",
            url: `/u/${targetUser.uid}/profile/subscribe/user`,
            name: "关注的用户",
            count: data.subUsersId.length
          },
          {
            type: "subscribe/forum",
            url: `/u/${targetUser.uid}/profile/subscribe/forum`,
            name: "关注的专业",
            count: data.subForumsId.length
          },
          {
            type: "subscribe/column",
            name: "关注的专栏",
            url: `/u/${targetUser.uid}/profile/subscribe/column`,
            count: data.subColumnsId.length
          },
          {
            type: "subscribe/thread",
            url: `/u/${targetUser.uid}/profile/subscribe/thread`,
            name: "关注的文章",
            count: data.subThreadsId.length
          },
          {
            type: "subscribe/collection",
            url: `/u/${targetUser.uid}/profile/subscribe/collection`,
            name: "收藏的文章",
            count: data.collectionThreadsId.length
          }
        ]
      },
      {
        name: "我的交往",
        links: [
          {
            type: "follower",
            name: "我的粉丝",
            url: `/u/${targetUser.uid}/profile/follower`,
            count: data.fansId.length
          },
          {
            type: 'blacklist',
            name: '黑名单',
            url: `/u/${targetUser.uid}/profile/blacklist`,
            count: await db.BlacklistModel.countDocuments({
              uid: targetUser.uid
            }),
          }
        ]
      }
    ];
    data.name = "";
    data.navLinks.map(nav => {
      nav.links.map(link => {
        if (data.type === link.type) data.name = link.name;
      })
    });
  }
  await next();
})

module.exports = router;
