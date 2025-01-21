const Router = require('koa-router');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const router = new Router();
router.put(
  '/keyword',
  OnlyOperation(Operations.experimentalKeywordSettings),
  async (ctx, next) => {
    const { db, body, data } = ctx;
    const { type, value } = body;
    if (type === 'enable' && typeof value === 'boolean') {
      await db.SettingModel.updateOne(
        { _id: 'review' },
        {
          $set: {
            'c.keyword.enable': value,
          },
        },
      );
    } else if (type === 'deleteWordGroup' && typeof value === 'string') {
      await db.SettingModel.updateOne(
        { _id: 'review' },
        {
          $pull: {
            'c.keyword.wordGroup': {
              id: value,
            },
          },
        },
      );
      await db.ForumModel.updateMany(
        {},
        {
          $pull: {
            'reviewSettings.keyword.rule.thread.useGroups': value,
            'reviewSettings.keyword.rule.reply.useGroups': value,
          },
        },
      );
    } else if (type === 'addWordGroup' && typeof value === 'object') {
      const { name, keywords, conditions } = value;
      if (!name) ctx.throw(403, '未指定组名');
      const filterEmptyKeywords = keywords.filter((keyword) => !!keyword);
      if (!filterEmptyKeywords.length) ctx.throw(403, '未添加关键词');
      if (
        await db.SettingModel.findOne({
          'c.keyword.wordGroup': {
            $elemMatch: { name },
          },
        })
      ) {
        ctx.throw(403, '词组名称重复');
      }
      const newId = db.SettingModel.newObjectId().toString();
      await db.SettingModel.updateOne(
        { _id: 'review' },
        {
          $addToSet: {
            'c.keyword.wordGroup': {
              id: newId,
              name,
              keywords: filterEmptyKeywords,
              conditions,
            },
          },
        },
      );
      data.id = newId;
    } else if (type === 'reviewCondition' && typeof value === 'object') {
      const { id, conditions } = value;
      await db.SettingModel.updateOne(
        { _id: 'review', 'c.keyword.wordGroup.id': id },
        {
          $set: {
            'c.keyword.wordGroup.$.conditions': conditions,
          },
        },
      );
    } else if (type === 'addKeywords') {
      const { groupId, keyword } = value;
      const shouldAddKeyword = keyword.toLowerCase();
      const reviewSettings = await db.SettingModel.getSettings('review');
      const wordGroups = reviewSettings.keyword.wordGroup;
      const group = wordGroups.find((group) => group.id === groupId);
      if (!group) {
        ctx.throw(403, '不存在此词组');
      }
      if (group.keywords.includes(shouldAddKeyword)) {
        data.added = false;
      } else {
        group.keywords.push(shouldAddKeyword);
        data.added = true;
      }
      await db.SettingModel.updateOne(
        { _id: 'review' },
        {
          'c.keyword.wordGroup': wordGroups,
        },
      );
    } else if (type === 'deleteKeywords') {
      const { groupId, keyword: shouldRemoveKeyword } = value;
      const reviewSettings = await db.SettingModel.getSettings('review');
      const wordGroups = reviewSettings.keyword.wordGroup;
      const group = wordGroups.find((group) => group.id === groupId);
      if (!group) {
        ctx.throw(403, '不存在此词组');
      }
      group.keywords = group.keywords.filter(
        (keyword) => keyword !== shouldRemoveKeyword,
      );
      await db.SettingModel.updateOne(
        { _id: 'review' },
        {
          'c.keyword.wordGroup': wordGroups,
        },
      );
    } else if (type === 'renameWordGroup') {
      const { id, newName } = value;
      const reviewSettings = await db.SettingModel.getSettings('review');
      const wordGroups = reviewSettings.keyword.wordGroup;
      for (group of wordGroups) {
        if (group.id === id) {
          group.name = newName;
          break;
        }
      }
      await db.SettingModel.updateOne(
        { _id: 'review' },
        {
          'c.keyword.wordGroup': wordGroups,
        },
      );
    } else if (type === 'applyAllForums') {
      await db.ForumModel.updateMany(
        {},
        {
          $addToSet: {
            'reviewSettings.keyword.rule.thread.useGroups': value,
            'reviewSettings.keyword.rule.reply.useGroups': value,
          },
        },
      );
    } else if (type === 'cancelApplyAllForums') {
      await db.ForumModel.updateMany(
        {},
        {
          $pull: {
            'reviewSettings.keyword.rule.thread.useGroups': value,
            'reviewSettings.keyword.rule.reply.useGroups': value,
          },
        },
      );
    } else {
      ctx.throw(403, '参数不正确');
    }
    await db.SettingModel.saveSettingsToRedis('review');
    return next();
  },
);
module.exports = router;
