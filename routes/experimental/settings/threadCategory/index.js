const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');

const router = require('koa-router')();
module.exports = router;
router
  .get(
    '/',
    OnlyOperation(Operations.experimentalThreadCategorySettings),
    async (ctx, next) => {
      const { db, data } = ctx;
      data.categoryTree = await db.ThreadCategoryModel.getCategoryTree({
        source: 'thread',
      });
      data.articleCategoryTree = await db.ThreadCategoryModel.getCategoryTree({
        source: 'article',
      });
      ctx.template = 'experimental/settings/threadCategory/threadCategory.pug';
      await next();
    },
  )
  .post(
    '/',
    OnlyOperation(Operations.experimentalThreadCategorySettings),
    async (ctx, next) => {
      const { db, body, data, nkcModules } = ctx;
      const { checkString } = nkcModules.checkData;
      const { name, description, warning, cid, threadWarning, source } = body;
      checkString(name, {
        name: '分类名',
        minLength: 0,
        maxLength: 20,
      });
      const saveName = await db.ThreadCategoryModel.countDocuments({
        name,
        source,
      });
      if (saveName) ctx.throw(400, `分类名已存在`);
      checkString(description, {
        name: '分类介绍',
        minLength: 0,
        maxLength: 2000,
      });
      checkString(warning, {
        name: '分类注意事项',
        minLength: 0,
        maxLength: 2000,
      });
      checkString(threadWarning, {
        name: '分类文章公告',
        minLength: 0,
        maxLength: 5000,
      });
      if (!['thread', 'article'].includes(source)) {
        ctx.throw(400, `分类来源错误 source: ${source}`);
      }
      if (cid) {
        const category = await db.ThreadCategoryModel.findOne({ _id: cid });
        if (!category) ctx.throw(400, `上级分类不存在 cid: ${cid}`);
      }
      await db.ThreadCategoryModel.newCategory({
        name,
        description,
        warning,
        cid,
        threadWarning,
        source,
      });
      data.categoryTree = await db.ThreadCategoryModel.getCategoryTree({
        source: 'thread',
      });
      data.articleCategoryTree = await db.ThreadCategoryModel.getCategoryTree({
        source: 'article',
      });
      await next();
    },
  )
  .put(
    '/',
    OnlyOperation(Operations.experimentalThreadCategorySettings),
    async (ctx, next) => {
      //更改分类顺序
      const { db, body, data } = ctx;
      const { categories } = body;
      for (const c of categories) {
        const { cid, order } = c;
        await db.ThreadCategoryModel.updateOne(
          { _id: cid },
          {
            $set: {
              order,
            },
          },
        );
      }
      data.categoryTree = await db.ThreadCategoryModel.getCategoryTree({
        source: 'thread',
      });
      data.articleCategoryTree = await db.ThreadCategoryModel.getCategoryTree({
        source: 'article',
      });
      await next();
    },
  )
  .put(
    '/:cid',
    OnlyOperation(Operations.experimentalThreadCategorySettings),
    async (ctx, next) => {
      const { db, body, nkcModules, params } = ctx;
      const { cid } = params;
      const {
        name,
        nodeName,
        description,
        warning,
        threadWarning,
        type,
        disabled,
        source,
      } = body;
      const category = await db.ThreadCategoryModel.findOnly({ _id: cid });
      const { checkString } = nkcModules.checkData;
      if (type === 'modifyInfo') {
        checkString(name, {
          name: '分类名',
          minLength: 0,
          maxLength: 20,
        });
        const saveName = await db.ThreadCategoryModel.countDocuments({
          source,
          name,
          _id: { $ne: cid },
        });
        if (saveName) ctx.throw(400, `分类名已存在`);
        checkString(description, {
          name: '分类介绍',
          minLength: 0,
          maxLength: 2000,
        });
        checkString(warning, {
          name: '分类注意事项',
          minLength: 0,
          maxLength: 2000,
        });
        checkString(threadWarning, {
          name: '分类文章公告',
          minLength: 0,
          maxLength: 5000,
        });
        await category.updateOne({
          $set: {
            name,
            description,
            warning,
            threadWarning,
          },
        });
      } else if (type === 'modifyNodeName') {
        checkString(nodeName, {
          name: '默认分类名',
          minLength: 0,
          maxLength: 20,
        });
        await category.updateOne({
          $set: {
            nodeName,
          },
        });
      } else {
        await category.updateOne({
          $set: {
            disabled,
          },
        });
      }
      await next();
    },
  )
  .del(
    '/:cid',
    OnlyOperation(Operations.experimentalThreadCategorySettings),
    async (ctx, next) => {
      const { params, db } = ctx;
      const { cid } = params;
      const category = await db.ThreadCategoryModel.findOnly({ _id: cid });
      await category.deleteAndClearReference();
      await next();
    },
  )
  .put(
    '/:cid/default',
    OnlyOperation(Operations.experimentalThreadCategorySettings),
    async (ctx, next) => {
      const { body, params, db } = ctx;
      const { defaultNode } = body;
      const { cid } = params;
      await db.ThreadCategoryModel.updateOne(
        { _id: cid },
        {
          $set: {
            defaultNode,
          },
        },
      );
      await next();
    },
  );
