const Router = require('koa-router');
const meRouter = new Router();
const { OnlyUnbannedUser, OnlyUser } = require('../../middlewares/permission');
meRouter
  .get('/resource', OnlyUser(), async (ctx, next) => {
    const { user } = ctx.data;
    const { db } = ctx;
    const quota = parseInt(ctx.query.quota);
    ctx.data.resources = await db.ResourceModel.find({ uid: user.uid })
      .sort({ toc: -1 })
      .limit(quota);
    await next();
  })
  .get('/media', OnlyUser(), async (ctx, next) => {
    //获取资源选择/资源管理
    const { user } = ctx.data;
    const { db, data, nkcModules, state } = ctx;
    let {
      sort = 'tlm',
      quota,
      skip,
      type = '',
      c,
      resourceCategories,
      reqType,
    } = ctx.query;
    let queryMap;
    const { uid } = state;
    if (!c) {
      c = 'all';
    }
    quota = parseInt(quota);
    skip = parseInt(skip);
    const types = type.split('-');
    const mediaTypes = types.map((item) => {
      switch (item) {
        case 'picture':
          return 'mediaPicture';
        case 'video':
          return 'mediaVideo';
        case 'audio':
          return 'mediaAudio';
        default:
          return 'mediaAttachment';
      }
    });
    queryMap = {
      uid: user.uid,
      mediaType: {
        $in: mediaTypes,
      },
    };
    if (c === 'unused') {
      queryMap['references.0'] = { $exists: false };
    } else if (c === 'used') {
      queryMap['references.0'] = { $exists: true };
    }
    queryMap.type = 'resource';
    queryMap.del = false;
    if (!resourceCategories) {
      resourceCategories = 'all';
    }
    if (resourceCategories === 'default') {
      queryMap.cid = '';
    } else if (resourceCategories === 'all') {
    } else if (resourceCategories === 'trash') {
      queryMap.del = true;
    } else {
      queryMap.cid = resourceCategories;
    }
    let newSkip = quota * skip;
    const sortObj = {
      toc: sort === '1' ? 1 : -1,
    };
    // 只需要分组资源数据
    if (reqType === 'resources') {
      data.resources = await db.ResourceModel.find(queryMap)
        .sort(sortObj)
        .skip(newSkip)
        .limit(quota);
      // 只需要分组信息
    } else if (reqType === 'group') {
      let categories = await db.ResourceCategoryModel.find({ uid }).sort({
        order: 1,
      });
      data.categories = await db.ResourceCategoryModel.extendCount(categories);
    } else {
      let mediaCount = await db.ResourceModel.find(queryMap).countDocuments();
      //获取用户自定义资源分类
      let categories = await db.ResourceCategoryModel.find({ uid }).sort({
        order: 1,
      });
      data.categories = await db.ResourceCategoryModel.extendCount(categories);
      data.paging = nkcModules.apiFunction.paging(skip, mediaCount, quota);
      let maxSkip = Math.ceil(mediaCount / quota);
      if (maxSkip < 1) {
        maxSkip = 1;
      }
      if (skip >= maxSkip) {
        ctx.data.skip = maxSkip - 1;
      } else {
        ctx.data.skip = skip;
      }
      if (newSkip > mediaCount) {
        ctx.throw(400, '已经是最后一页了');
      }
      ctx.data.maxSkip = maxSkip;
      ctx.data.count = {
        ungroupedCount: await db.ResourceModel.countDocuments({
          del: false,
          cid: '',
          uid: user.uid,
          type: 'resource',
        }),
        allCount: await db.ResourceModel.countDocuments({
          del: false,
          uid: user.uid,
          type: 'resource',
        }),
        trashCount: await db.ResourceModel.countDocuments({
          del: true,
          uid: user.uid,
          type: 'resource',
        }),
      };
      ctx.data.resources = await db.ResourceModel.find(queryMap)
        .sort(sortObj)
        .skip(newSkip)
        .limit(quota);
      const uploadSettings = await db.SettingModel.getSettings('upload');
      data.sizeLimit = uploadSettings.sizeLimit;
    }
    await next();
  })
  .get('/life_photos', OnlyUser(), async (ctx, next) => {
    const { data, db } = ctx;
    const { user } = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({
      uid: user.uid,
    });
    data.lifePhotos = await userPersonal.extendLifePhotos();
    await next();
  });

module.exports = meRouter;
