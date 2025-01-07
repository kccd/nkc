const Router = require('koa-router');
const customCheerio = require('../../nkcModules/nkcRender/customCheerio');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { OnlyUser, OnlyUnbannedUser } = require('../../middlewares/permission');
const router = new Router();
router
  // 查看全部分类
  .get('/', OnlyUser(), async (ctx, next) => {
    const { data, db, query } = ctx;
    const { column } = data;
    const { from } = query;
    if (from === 'post') {
      let { cid } = query;
      if (cid) cid = parseInt(cid);
      data.mainCategories = await db.ColumnPostCategoryModel.getCategoryList(
        column._id,
      );
      const categories = await db.ColumnPostCategoryModel.find({
        columnId: column._id,
        type: 'main',
      });
      const columnPosts = await db.ColumnPostModel.find({
        columnId: column._id,
      });
      const categoriesObject = {};
      categories.forEach((item) => {
        categoriesObject[item._id] = item;
      });

      const categoriesChildObject = {};
      for (const item of data.mainCategories) {
        if (categoriesObject[item._id]) {
          const childIds = [];
          const findChildId = (category) => {
            for (const c of data.mainCategories) {
              if (c.parentId === category._id) {
                childIds.push(c._id);
                findChildId(c);
              }
            }
          };
          findChildId(categoriesObject[item._id]);
          childIds.push(item._id);
          categoriesChildObject[item._id] = childIds;
        }
        if (categoriesChildObject[item._id]) {
          let count = 0;
          for (const columnPost of columnPosts) {
            if (
              columnPost.cid.some((cid) =>
                categoriesChildObject[item._id].some((id) => id === cid),
              )
            ) {
              count++;
            }
          }
          item.count = count;
        }
      }
      const mainCategoryPostCount = await db.ColumnPostModel.countDocuments({
        columnId: column._id,
      });
      data.mainCategories.unshift({
        _id: 'all',
        name: '全部',
        fixed: true,
        count: mainCategoryPostCount,
      });
      let minorCategoryPostCount = 0;
      for (const mc of data.mainCategories) {
        if (!cid) {
          minorCategoryPostCount = data.mainCategories[0].count;
          break;
        } else if (mc._id === cid) {
          minorCategoryPostCount = mc.count;
          break;
        }
      }
      const match = {
        columnId: column._id,
        mcid: [],
      };
      if (cid) {
        const childCategoryId =
          await db.ColumnPostCategoryModel.getChildCategoryId(cid);
        childCategoryId.push(cid);
        // match.cid = cid;
        match.cid = { $in: childCategoryId };
      }
      const minorCategoryPostCountOther =
        await db.ColumnPostModel.countDocuments(match);
      data.minorCategories =
        await db.ColumnPostCategoryModel.getMinorCategories(
          column._id,
          cid,
          true,
        );
      data.minorCategories.unshift({
        _id: 'other',
        name: '未分类',
        fixed: true,
        count: minorCategoryPostCountOther,
      });
      data.minorCategories.unshift({
        _id: 'all',
        fixed: true,
        name: '全部',
        count: minorCategoryPostCount,
      });
    } else if (from === 'dialog') {
      data.mainCategories = await db.ColumnPostCategoryModel.getCategoryList(
        column._id,
      );
      data.minorCategories =
        await db.ColumnPostCategoryModel.getMinorCategories(column._id);
    } else if (from === 'fastPost') {
      data.mainCategories = await db.ColumnPostCategoryModel.getCategoryList(
        column._id,
      );
      data.minorCategories =
        await db.ColumnPostCategoryModel.getMinorCategories(column._id);
    } else {
      const categories = await db.ColumnPostCategoryModel.find({
        columnId: column._id,
      }).sort({ toc: 1 });
      data.categories = await db.ColumnPostCategoryModel.extendCategories(
        categories,
      );
    }
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, db, body, nkcModules } = ctx;
    const { column, user } = data;
    const userPermissionObject =
      await db.ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await db.ColumnModel.checkUsersPermission(
      column.users,
      user.uid,
      userPermissionObject.column_settings_category,
    );
    if (column.uid !== user.uid && !isPermission) ctx.throw(403, '权限不足');
    // if(column.uid !== user.uid&&!column.users.includes(user.uid)) ctx.throw(403, "权限不足");
    let { name, description, parentId, type, brief } = body;
    const { checkString } = nkcModules.checkData;
    if (!['main', 'minor'].includes(type))
      ctx.throw(400, `分类类型错误 type: ${type}`);
    checkString(name, {
      name: '分类名',
      minLength: 1,
      maxLength: 20,
    });
    const sameName = await db.ColumnPostCategoryModel.findOne({
      columnId: column._id,
      name,
    });
    if (sameName) ctx.throw(400, '分类名已存在');
    checkString(brief, {
      name: '分类简介',
      minLength: 1,
      maxLength: 100,
    });
    // checkString(description, {
    //   name: '分类介绍',
    //   minLength: 0,
    //   maxLength: 100000,
    // });
    let content = '';
    content = customCheerio
      .load(renderHTMLByJSON({ json: description }))
      .text();
    if (content.length > 100000) {
      ctx.throw(400, `分类介绍不能超过100000字`);
    }
    if (type === 'main') {
      if (parentId) {
        const parentCategory = await db.ColumnPostCategoryModel.findOne({
          columnId: column._id,
          _id: parentId,
        });
        if (!parentCategory) ctx.throw(400, '父分类设置错误，请刷新');
      }
    } else {
      parentId = null;
    }
    const category = db.ColumnPostCategoryModel({
      _id: await db.SettingModel.operateSystemID('columnPostCategories', 1),
      name,
      type,
      description,
      brief,
      parentId,
      columnId: column._id,
    });
    await category.save();
    data.category = category;
    await db.ResourceModel.toReferenceSourceByJson(
      'columnCategory-' + category._id,
      description,
    );
    // await db.ResourceModel.toReferenceSource("columnCategory-" + category._id, description);
    await db.ColumnPostCategoryModel.computeCategoryOrder(column._id);
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, data, body } = ctx;
    const { column, user } = data;
    const userPermissionObject =
      await db.ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await db.ColumnModel.checkUsersPermission(
      column.users,
      user.uid,
      userPermissionObject.column_settings_category,
    );
    if (column.uid !== user.uid && !isPermission) ctx.throw(403, '权限不足');
    // if(column.uid !== user.uid&&!column.users.includes(user.uid)) ctx.throw(403, "权限不足");
    const { categoriesId } = body;
    for (let i = 0; i < categoriesId.length; i++) {
      const category = await db.ColumnPostCategoryModel.findOne({
        columnId: column._id,
        _id: categoriesId[i],
      });
      if (category) {
        await category.updateOne({ order: i + 1 });
      }
    }
    await next();
  })
  .put('/:categoryId', OnlyUnbannedUser(), async (ctx, next) => {
    const { nkcModules, data, db, body } = ctx;
    const { categoryId } = ctx.params;
    const { column, user } = data;
    const userPermissionObject =
      await db.ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await db.ColumnModel.checkUsersPermission(
      column.users,
      user.uid,
      userPermissionObject.column_settings_category,
    );
    if (column.uid !== user.uid && !isPermission) ctx.throw(403, '权限不足');
    // if(column.uid !== user.uid&&!column.users.includes(user.uid)) ctx.throw(403, "权限不足");
    const category = await db.ColumnPostCategoryModel.findOne({
      _id: categoryId,
    });
    if (!category) ctx.throw(400, '分类不存在');
    const { checkString } = nkcModules.checkData;
    const { name, description, brief } = body;
    checkString(name, {
      name: '分类名',
      minLength: 1,
      maxLength: 20,
    });
    const sameName = await db.ColumnPostCategoryModel.findOne({
      columnId: column._id,
      name,
      _id: { $ne: categoryId },
    });
    if (sameName) ctx.throw(400, '分类名已存在');
    checkString(brief, {
      name: '分类简介',
      minLength: 1,
      maxLength: 100,
    });
    // checkString(description, {
    //   name: '分类介绍',
    //   minLength: 0,
    //   maxLength: 100000,
    // });
    let content = '';
    if (category.l === 'json') {
      content = customCheerio
        .load(renderHTMLByJSON({ json: description }))
        .text();
    } else {
      content = customCheerio.load(description).text();
    }
    if (content.length > 100000) {
      ctx.throw(400, `分类介绍不能超过100000字`);
    }
    await category.updateOne({
      name,
      brief,
      description,
    });
    if (category.l === 'json') {
      await db.ResourceModel.toReferenceSourceByJson(
        'columnCategory-' + category._id,
        description,
      );
    } else {
      await db.ResourceModel.toReferenceSource(
        'columnCategory-' + category._id,
        description,
      );
    }
    await db.ColumnPostCategoryModel.computeCategoryOrder(column._id);
    await next();
  })
  // 删除分类
  .del('/:categoryId', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, db } = ctx;
    const { column, user } = data;
    const userPermissionObject =
      await db.ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await db.ColumnModel.checkUsersPermission(
      column.users,
      user.uid,
      userPermissionObject.column_settings_category,
    );
    if (column.uid !== user.uid && !isPermission) ctx.throw(403, '权限不足');
    // if(column.uid !== user.uid&&!column.users.includes(user.uid)) ctx.throw(403, "权限不足");
    const { categoryId } = ctx.params;
    const category = await db.ColumnPostCategoryModel.findById(categoryId);
    if (!category) ctx.throw(400, '分类不存在');
    if (category.default) ctx.throw(400, '无法删除默认分类');
    const children = await db.ColumnPostCategoryModel.countDocuments({
      columnId: column._id,
      parentId: categoryId,
    });
    if (children > 0) ctx.throw(400, '该分类下还有其他分类，无法删除');
    const match = {
      columnId: column._id,
    };
    if (category.type === 'main') {
      // 主分类
      match.cid = category._id;
    } else {
      // 辅分类
      match.mcid = category._id;
    }
    const postCount = await db.ColumnPostModel.countDocuments(match);
    if (postCount > 0) ctx.throw(400, '该分类下存在内容，无法删除');
    await db.ColumnPostCategoryModel.deleteOne({
      columnId: column._id,
      _id: category._id,
    });
    await next();
  });
module.exports = router;
