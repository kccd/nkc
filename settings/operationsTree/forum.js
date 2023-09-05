const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitForumsCategory, // 查看全部专业
  POST: Operations.addForum, // 添加专业
  PARAMETER: {
    GET: Operations.visitForumHome, // 查看专业主页
    POST: Operations.postToForum, // 在专业中发表文章
    DELETE: Operations.deleteForum, // 删除专业
    child: {
      GET: Operations.getForumChildForums,
    },
    card: {
      GET: Operations.visitForumCard,
    },
    latest: {
      GET: Operations.visitForumLatest, // 查看专业最新文章列表
    },
    home: {
      GET: Operations.visitForumHome, // 查看专业主页
    },
    visitors: {
      GET: Operations.viewForumVisitors, // 查看来访者
    },
    followers: {
      GET: Operations.viewForumFollowers, // 查看关注者
    },
    settings: {
      GET: Operations.visitForumInfoSettings, // 查看专业基本信息设置
      info: {
        declare: {
          PUT: Operations.saveForumDeclare,
        }, // 保存编辑内容
        latestBlockNotice: {
          PUT: Operations.saveForumLatestBlockNotice,
        }, // 保存编辑内容
        GET: Operations.visitForumInfoSettings, // 查看专业基本信息设置
        PUT: Operations.modifyForumInfo, // 修改专业基本信息设置
      },
      merge: {
        GET: Operations.visitForumMergeSettings, // 查看专业合并
        PUT: Operations.modifyMergeSettings, // 修改专业合并设置
      },
      kind: {
        PUT: Operations.addForumKind, // 添加专业类别
        clear: {
          PUT: Operations.delForumKind, // 清除专业类别
        },
      },
      category: {
        GET: Operations.visitForumCategorySettings, // 查看专业分类设置
        PUT: Operations.modifyForumCategory, // 修改专业分类设置
        POST: Operations.addForumCategory, // 添加专业下的文章分类
        DELETE: Operations.removeForumCategory, // 删除专业下的文章分类
      },
      permission: {
        GET: Operations.visitForumPermissionSettings, // 查看专业权限设置
        PUT: Operations.modifyForumPermission, // 修改专业权限设置
      },
      score: {
        GET: Operations.forumScoreSettings,
        PUT: Operations.forumScoreSettings,
      },
      review: {
        GET: Operations.forumReviewSettings, // 查看审核设置
        PUT: Operations.forumReviewSettings, // 修改专业审核设置
      },
    },
    subscribe: {
      DELETE: Operations.unSubscribeForum, // 用户取消关注专业
      POST: Operations.subscribeForum, // 用户关注专业
    },
    library: {
      GET: Operations.visitForumLibrary,
      POST: Operations.createForumLibrary,
    },
  },
};
