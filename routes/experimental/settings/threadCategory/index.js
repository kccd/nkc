const router = require('koa-router')();
module.exports = router;
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.categoryTree = await db.ThreadCategoryModel.getCategoryTree();
    ctx.template = 'experimental/settings/threadCategory/threadCategory.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, data, nkcModules} = ctx;
    const {checkString} = nkcModules.checkData;
    const {name, description, warning, cid} = body;
    checkString(name, {
      name: '分类名',
      minLength: 0,
      maxLength: 20
    });
    const saveName = await db.ThreadCategoryModel.countDocuments({name});
    if(saveName) ctx.throw(400, `分类名已存在`);
    checkString(description, {
      name: '分类介绍',
      minLength: 0,
      maxLength: 2000
    });
    checkString(warning, {
      name: '分类注意事项',
      minLength: 0,
      maxLength: 2000
    });
    if(cid) {
      const category = await db.ThreadCategoryModel.findOne({_id: cid});
      if(!category) ctx.throw(400, `上级分类不存在 cid: ${cid}`);
    }
    await db.ThreadCategoryModel.newCategory(name, description, warning, cid);
    data.categoryTree = await db.ThreadCategoryModel.getCategoryTree();
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, data} = ctx;
    const {categories} = body;
    for(const c of categories) {
      const {cid, order} = c;
      await db.ThreadCategoryModel.updateOne({_id: cid}, {
        $set: {
          order,
        }
      });
    }
    data.categoryTree = await db.ThreadCategoryModel.getCategoryTree();
    await next();
  })
  .put('/:cid', async (ctx, next) => {
    const {db, body, nkcModules, params} = ctx;
    const {cid} = params;
    const {name, nodeName, description, warning, type, disabled} = body;
    const category = await db.ThreadCategoryModel.findOnly({_id: cid});
    const {checkString} = nkcModules.checkData;
    if(type === 'modifyInfo') {
      checkString(name, {
        name: '分类名',
        minLength: 0,
        maxLength: 20
      });
      const saveName = await db.ThreadCategoryModel.countDocuments({name, _id: {$ne: cid}});
      if (saveName) ctx.throw(400, `分类名已存在`);
      checkString(description, {
        name: '分类介绍',
        minLength: 0,
        maxLength: 2000
      });
      checkString(warning, {
        name: '分类注意事项',
        minLength: 0,
        maxLength: 2000
      });
      await category.updateOne({
        $set: {
          name,
          description,
          warning
        }
      });
    } else if(type === 'modifyNodeName') {
      checkString(nodeName, {
        name: '默认分类名',
        minLength: 0,
        maxLength: 20
      });
      await category.updateOne({
        $set: {
          nodeName
        }
      });
    } else {
      await category.updateOne({
        $set: {
          disabled
        }
      });
    }
    await next();
  })
  .del('/:cid', async (ctx, next) => {
    const {params, db} = ctx;
    const {cid} = params;
    const category = await db.ThreadCategoryModel.findOnly({_id: cid});
    const nodes = await db.ThreadCategoryModel.find({cid});
    const categoriesId = [category._id];
    nodes.map(n => categoriesId.push(n._id));
    await db.ThreadModel.updateMany({
      tcId: {$in: categoriesId}
    }, {
      $pull: {
        tcId: {
          $in: categoriesId
        }
      }
    });
    await db.PostModel.updateMany({
      tcId: {$in: categoriesId}
    }, {
      $pull: {
        tcId: {
          $in: categoriesId
        }
      }
    });
    await db.DraftModel.updateMany({
      tcId: {$in: categoriesId}
    }, {
      $pull: {
        tcId: {
          $in: categoriesId
        }
      }
    });
    await db.ThreadCategoryModel.deleteMany({_id: {$in: categoriesId}});

    await next();
  });
