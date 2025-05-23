const Router = require('koa-router');
const router = new Router();
const categoryRouter = require('./category');
const settingsRouter = require('./settings');
const postRouter = require('./post');
const subscribeRouter = require('./subscribe');
const statusRouter = require('./status');
const contributeRouter = require('./contribute');
const disabledRouter = require('./disabled');
const contactRouter = require('./contact');
const topRouter = require('./top');
const hotRouter = require('./hot');
const pageRouter = require('./page');
const articleRouter = require('./article');
const {
  columnNameCheckerService,
} = require('../../services/column/columnNameChecker.service');
const {
  columnAbbrCheckerService,
} = require('../../services/column/columnAbbrChecker.service');
const { Public, OnlyUnbannedUser } = require('../../middlewares/permission');
router
  .use('/', Public(), async (ctx, next) => {
    const { db, params, data, nkcModules } = ctx;
    const { _id } = params;
    const { user } = data;
    const column = await db.ColumnModel.findById(_id);
    if (!column) {
      const u = await db.UserModel.findOne({ uid: _id });
      if (u) {
        return ctx.redirect(`/u/${u.uid}`);
      }
      ctx.throw(404, `未找到ID为${_id}的专栏`);
    }
    //获取当前用户是否能查看所有状态的文章
    data.isModerator =
      ctx.permissionsOr(['review', 'movePostsToDraft', 'movePostsToRecycle']) ||
      (user && user.uid === column.uid);
    if (!ctx.permission('column_single_disabled')) {
      if (column.disabled) {
        nkcModules.throwError(403, '专栏已屏蔽', 'columnHasBeenBanned');
      }
      if (column.closed) {
        nkcModules.throwError(403, '专栏已关闭', 'columnHasBeenClosed');
      }
    }
    data.column = column;
    if (user && user.uid === data.column.uid) {
      data.contributeCount = await db.ColumnContributeModel.countDocuments({
        columnId: column._id,
        // passed: null,
        passed: 'pending',
      });
    }
    const timeout = 24 * 60 * 60 * 1000;
    if (
      !column.refreshTime ||
      Date.now() - new Date(column.refreshTime).getTime() > timeout
    ) {
      await column.updateBasicInfo();
    }
    if (data.user) {
      data.userSubscribeUsersId = await db.SubscribeModel.getUserSubUsersId(
        data.user.uid,
      );
      data.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(
        data.user.uid,
      );
    }

    data.columnSubscribeInfo = {
      subCount: nkcModules.tools.briefNumber(data.column.subCount),
      postVoteUp: nkcModules.tools.briefNumber(data.column.postVoteUp),
      postHits: nkcModules.tools.briefNumber(data.column.postHits),
    };

    await next();
  })
  .use(['/a', '/page'], Public(), async (ctx, next) => {
    const { data, db } = ctx;
    const { column } = data;
    // 专栏内容公共部分数据
    data.column = await column.extendColumn();
    data.navCategories = await db.ColumnPostCategoryModel.getColumnNavCategory(
      column._id,
    );
    data.categories = await db.ColumnPostCategoryModel.getCategoryList(
      column._id,
    );
    data.timeline = await db.ColumnModel.getTimeline(column._id);
    await next();
  })
  .get('/', Public(), async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { isModerator } = data;
    let { page = 0, c: categoriesIdString = '' } = query;
    page = Number(page);
    const categoriesId = categoriesIdString.split('-');
    let cid = categoriesId[0];
    let mcid = categoriesId[1];
    if (cid) {
      cid = parseInt(cid);
    }
    if (mcid) {
      mcid = parseInt(mcid);
    }
    ctx.template = 'columns/column.pug';
    const { column } = data;
    data.column = await column.extendColumn();
    const q = {
      columnId: column._id,
    };
    data.authorAccountRegisterInfo = await db.UserModel.getAccountRegisterInfo({
      uid: column.uid,
    });

    //当前用户能查看的文章
    const fidOfCanGetThread = await db.ForumModel.getReadableForumsIdByUid(
      data.user ? data.user.uid : '',
    );
    const sort = {};
    if (cid) {
      //主分类
      const category = await db.ColumnPostCategoryModel.findOnly({ _id: cid });
      if (category.columnId !== column._id) {
        ctx.throw(400, `文章分类【${cid}】不存在或已被专栏主删除`);
      }
      if (page === 0 && !mcid) {
        data.categoryDescription = await category.renderDescription(
          data?.user?.xsf,
        );
      }
      //主分类的子分类
      data.childCategories = await category.getChildCategories();
      data.category = category;
      //分类下的文章数量
      // data.categoryPostCount = await db.ColumnPostModel.countDocuments({
      //   columnId: column._id,
      //   cid: category._id,
      // });
      //分类导航
      data.categoriesNav = await db.ColumnPostCategoryModel.getCategoryNav(
        category._id,
      );
      //子分类
      const minorCategories =
        await db.ColumnPostCategoryModel.getMinorCategories(
          column._id,
          data.category._id,
          true,
        );
      data.minorCategories = minorCategories.filter((mc) => {
        // data.categoryPostCount += mc.count;
        return mc.count > 0;
      });
      const childCategoryId =
        await db.ColumnPostCategoryModel.getChildCategoryId(cid);
      childCategoryId.push(cid);
      //分类下的文章数量
      data.categoryPostCount = await db.ColumnPostModel.countDocuments({
        columnId: column._id,
        cid: { $in: childCategoryId },
      });
      let minorCategory;
      if (mcid) {
        minorCategory = await db.ColumnPostCategoryModel.findOne({ _id: mcid });
        sort[`order.cid_${category._id}_${mcid}`] = -1;
      } else {
        sort[`order.cid_${category._id}_default`] = -1;
      }
      if (minorCategory) {
        q.mcid = minorCategory._id;
        data.minorCategory = minorCategory;
        await data.minorCategory.renderDescription(data?.user?.xsf);
      }
      q.cid = { $in: childCategoryId };
      data.topped = await db.ColumnPostModel.getToppedColumnPosts({
        columnId: column._id,
        fidOfCanGetThread,
        cid,
        isModerator,
      });
      data.toppedId = data.category.topped;
      // sort[`order.cid_${category._id}`] = -1;
    } else {
      data.topped = await db.ColumnPostModel.getToppedColumnPosts({
        columnId: column._id,
        fidOfCanGetThread,
        isModerator,
      });
      data.toppedId = data.column.topped;
      if (mcid) {
        sort[`order.cid_default_${mcid}`] = -1;
      } else {
        sort[`order.cid_default_default`] = -1;
      }
      // sort[`order.cid_default`] = -1;
    }
    if (page === 0 && !query.c) {
      data.homePage = await db.ColumnModel.getHomePageByColumnId(column._id);
    }
    const count = await db.ColumnPostModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count, column.perpage);
    const columnPosts = await db.ColumnPostModel.find(q)
      .sort(sort)
      .skip(paging.start)
      .limit(paging.perpage);

    data.paging = paging;
    //获取专栏文章
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts({
      columnPosts,
      fidOfCanGetThread,
      isModerator,
    });
    data.navCategories = await db.ColumnPostCategoryModel.getColumnNavCategory(
      column._id,
    );
    data.categories = await db.ColumnPostCategoryModel.getCategoryList(
      column._id,
    );

    if (data.categories.length > 0) {
      data.categories.forEach(async (item) => {
        const childId = await db.ColumnPostCategoryModel.getChildCategoryId(
          item._id,
        );
        childId.push(item._id);
        item.count = await db.ColumnPostModel.countDocuments({
          columnId: column._id,
          cid: { $in: childId },
        });
      });
    }
    data.timeline = await db.ColumnModel.getTimeline(column._id);
    const homeSettings = await db.SettingModel.getSettings('home');
    if (ctx.permission('homeHotColumn')) {
      data.homeHotColumn = homeSettings.columnsId.includes(column._id);
    }
    if (ctx.permission('homeToppedColumn')) {
      data.homeToppedColumn = homeSettings.toppedColumnsId.includes(column._id);
    }
    data.permissions = {
      homeHotColumn: ctx.permission('homeHotColumn'),
      homeToppedColumn: ctx.permission('homeToppedColumn'),
      column_single_disabled: ctx.permission('column_single_disabled'),
    };
    data.c = categoriesIdString;
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, db, body, tools } = ctx;
    const { contentLength } = tools.checkString;
    const { column, user } = data;
    if (column.uid !== user.uid && !ctx.permission('column_single_disabled')) {
      ctx.throw(403, '权限不足');
    }
    const { files, fields } = body;
    const type = body.type || fields.type;
    if (!type) {
      let {
        abbr,
        name,
        description,
        color,
        notice,
        links = [],
        otherLinks = [],
        blocks = [],
        navCategory,
        perpage = 30,
        hideDefaultCategory,
        listColor,
        toolColor,
        users = [],
      } = fields;
      if ([...JSON.parse(users)].some((item) => item.uid === user.uid)) {
        ctx.throw(400, '请不要选择自己作为专栏管理员');
      }
      const { avatar, banner } = files;
      await columnNameCheckerService.checkColumnName(name, column._id);
      await columnAbbrCheckerService.checkColumnAbbr(abbr);
      if (notice) {
        if (contentLength(notice) > 600) {
          ctx.throw(400, '公告通知不能超过600字符');
        }
        notice = notice.replace(/!\[.*?]\(.*?\)/gi, '');
        notice = notice.replace(/\[.*?]\(.*?\)/gi, '');
      }
      if (links) {
        links = JSON.parse(links);
        const links_ = [];
        for (const link of links) {
          const { name, url, links } = link;
          if (!name) {
            ctx.throw(400, '自定义链接名不能为空');
          }
          if (!url) {
            ctx.throw(400, '自定义链接不能为空');
          }
          if (contentLength(name) > 20) {
            ctx.throw(400, '自定义链接名不能超过20字节');
          }
          for (const childLink of link.links) {
            const { name, url } = childLink;
            if (!name) {
              ctx.throw(400, '自定义链接名不能为空');
            }
            if (!url) {
              ctx.throw(400, '自定义链接不能为空');
            }
            if (contentLength(name) > 20) {
              ctx.throw(400, '自定义链接名不能超过20字节');
            }
          }
          links_.push({
            name,
            url,
            links,
          });
        }
        links = links_;
      }
      if (otherLinks) {
        otherLinks = JSON.parse(otherLinks);
        const otherLinks_ = [];
        for (const link of otherLinks) {
          const { name, url } = link;
          if (!name) {
            ctx.throw(400, '友情链接名不能为空');
          }
          if (!url) {
            ctx.throw(400, '友情链接不能为空');
          }
          if (contentLength(name) > 20) {
            ctx.throw(400, '友情链接名不能超过20字节');
          }
          otherLinks_.push({
            name,
            url,
          });
        }
        otherLinks = otherLinks_;
      }
      if (blocks) {
        blocks = JSON.parse(blocks);
        if (blocks.length > 5) {
          ctx.throw(400, '自定义内容数量不能超过5');
        }
        for (const block of blocks) {
          if (!block.name) {
            ctx.throw(400, '自定义内容标题不能为空');
          }
          if (contentLength(block.name) > 20) {
            ctx.throw(400, '自定义标题不能超过20字节');
          }
          if (!block.content) {
            ctx.throw(400, '自定义内容不能为空');
          }
          if (contentLength(block.content) > 1000) {
            ctx.throw(400, '自定义内容不能超过1000字节');
          }
          block.content = block.content.replace(/!\[.*?]\(.*?\)/gi, '');
          block.content = block.content.replace(/\[.*?]\(.*?\)/gi, '');
          block.show = !!block.show;
        }
      }
      perpage = parseInt(perpage);
      if (isNaN(perpage) || perpage <= 0) {
        perpage = 1;
      }
      await column.updateOne({
        name,
        color,
        listColor,
        toolColor,
        perpage,
        links,
        hideDefaultCategory,
        otherLinks,
        navCategory,
        blocks,
        notice,
        nameLowerCase: name.toLowerCase(),
        description,
        abbr,
        users: JSON.parse(users),
      });
      if (avatar) {
        await db.AttachmentModel.saveColumnAvatar(column._id, avatar);
      }
      if (banner) {
        await db.AttachmentModel.saveColumnBanner(column._id, banner);
      }
      await db.ColumnModel.toSearch(column._id);
    } else if (type === 'color') {
      const { color, listColor, toolColor } = body;
      await column.updateOne({
        color,
        listColor,
        toolColor,
      });
    }
    await next();
  })
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/post', postRouter.routes(), postRouter.allowedMethods())
  .use('/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use(
    '/contribute',
    contributeRouter.routes(),
    contributeRouter.allowedMethods(),
  )
  .use('/status', statusRouter.routes(), statusRouter.allowedMethods())
  .use('/disabled', disabledRouter.routes(), disabledRouter.allowedMethods())
  .use('/contact', contactRouter.routes(), contactRouter.allowedMethods())
  .use('/page', pageRouter.routes(), pageRouter.allowedMethods())
  .use('/top', topRouter.routes(), topRouter.allowedMethods())
  .use('/hot', hotRouter.routes(), hotRouter.allowedMethods())
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
