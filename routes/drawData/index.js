const router = require("koa-router")();
router
  .get('/:uid/leftDraw', async (ctx, next) => {
    const {data, query, state, db, params, permission} = ctx;
    const {uid} = params;
    const homeSettings = await db.SettingModel.getSettings("home");
    // 是否启用了基金
    const fundSettings = await db.SettingModel.getSettings('fund');
    // 是否启用了网站工具
    const toolSettings = await db.SettingModel.getSettings("tools");
    //构建专业树
    data.forumsTree = await db.ForumModel.getForumsTree(
      data.userRoles,
      data.userGrade,
      data.user
    );
    const forumsObj = {};
    data.forumsTree.map(f => {
      const {categoryId} = f;
      if(!forumsObj[categoryId]) forumsObj[categoryId] = [];
      forumsObj[categoryId].push(f);
    });
    data.forumCategories = await db.ForumCategoryModel.getCategories();
    data.categoryForums = [];
    data.forumCategories.map(fc => {
      const _fc = Object.assign({}, fc);
      const {_id} = _fc;
      _fc.forums = forumsObj[_id] || [];
      if(_fc.forums.length) data.categoryForums.push(_fc);
    });
    data.permission = {
      nkcManagement: permission('nkcManagement'),
      visitExperimentalStatus: permission('visitExperimentalStatus'),
      review: permission('review'),
      complaintGet: permission('complaintGet'),
      visitProblemList: permission('visitProblemList'),
      getLibraryLogs: permission('getLibraryLogs'),
      fundSettings: fundSettings,
      hasUser: data.user?true:false,
      showActivityEnter: homeSettings.showActivityEnter,
      siteToolEnabled: toolSettings.enabled,
      enableFund: fundSettings.enableFund,
      fundName: fundSettings.enableFund?fundSettings.fundName:null,
    };
    const recycleId = await db.SettingModel.getRecycleId();
    // 管理 未处理条数
    if(!state.isApp) {
      if(permission("complaintGet")) {
        data.unResolvedComplaintCount = await db.ComplaintModel.countDocuments({resolved: false});
      }
      if(permission("visitProblemList")) {
        data.unResolvedProblemCount = await db.ProblemModel.countDocuments({resolved: false});
      }
      if(permission("review")) {
        const q = {
          reviewed: false,
          disabled: false,
          mainForumsId: {$ne: recycleId}
        };
        if(!permission("superModerator")) {
          const forums = await db.ForumModel.find({moderators: data.user.uid}, {fid: 1});
          const fid = forums.map(f => f.fid);
          q.mainForumsId = {
            $in: fid
          }
        }
        const posts = await db.PostModel.find(q, {tid: 1, pid: 1});
        const threads = await db.ThreadModel.find({tid: {$in: posts.map(post => post.tid)}}, {recycleMark: 1, oc: 1, tid: 1});
        const threadsObj = {};
        threads.map(thread => threadsObj[thread.tid] = thread);
        let count = 0;
        posts.map(post => {
          const thread = threadsObj[post.tid];
          if(thread && (thread.oc !== post.pid || !thread.recycleMark)) {
            count++;
          }
        });
        data.unReviewedCount = count;
      }
    }
    await next();
  })
  .get('/:uid/rightDraw', async (ctx, next) => {
    const {data, db,state, params, query, permission} = ctx;
    data.res = '1111';
    await next();
  })
  .get('/:uid/userDraw', async (ctx, next) => {
    const {data, db, state, params, permission, nkcModules} = ctx;
    const {uid, username, info, avatar} = data.user;
    data.drawState = {
      columnPermission: await db.UserModel.ensureApplyColumnPermission(data.user),
      uid,
      userInfo: {
        avatar: nkcModules.tools.getUrl('userAvatar', avatar),
        name: username,
        certsName: info.certsName,
        scores: await db.UserModel.getUserScores(data.user.uid),
        userColumn: await db.UserModel.getUserColumn(data.user.uid),
        draftCount: data.user.draftCount,
      }
    };
    await next();
  })
  .get('/:uid/userNav', async (ctx, next) => {
    const {data, db, params, permission, nkcModules} = ctx;
    const userScores = await db.UserModel.getUserScores(data.user.uid);
    const userColumn = await db.UserModel.getUserColumn(data.user.uid);
    const userInfo = {
      banner: nkcModules.tools.getUrl('userBanner', data.user.banner),
      avatar: nkcModules.tools.getUrl('userAvatar', data.user.avatar),
      username: data.user.username,
      gradeColor: data.user.grade.color,
      gradeName: data.user.grade.displayName,
      certsName: data.user.info? data.user.info.certsName: '',
      scores: userScores? userScores.map(score => {
        score.icon = nkcModules.tools.getUrl('scoreIcon', score.icon);
        return score;
      }): [],
      xsf: data.user.xsf,
      columnId: userColumn? userColumn._id: null,
      draftCount: await db.DraftModel.countDocuments({uid: data.user.uid}),
      gradeIcon: nkcModules.tools.getUrl("gradeIcon", data.user.grade._id),
    };
    data.anvState = {
      uid: data.user.uid,
      xsfIcon: nkcModules.tools.getUrl('defaultFile', 'xsf.png'),
      userInfo,
      columnPermission: await db.UserModel.ensureApplyColumnPermission(data.user),
    };
    await next();
  })
module.exports = router;
