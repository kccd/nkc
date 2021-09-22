const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) =>{
    const {data, db} = ctx;
    ctx.template = "experimental/settings/review/review.pug";
    data.grades = await db.UsersGradeModel.find({}).sort({_id: 1});
    data.reviewSettings = await db.SettingModel.getSettings('review');
    // data.reviewSettings = (await db.SettingModel.findById("review")).c;
    data.certs = await db.RoleModel.find().sort({toc: -1});
    let uid = data.reviewSettings.post.special.whitelistUid;
    uid = uid.concat(data.reviewSettings.post.special.blacklistUid);
    uid = uid.concat(data.reviewSettings.thread.special.blacklistUid);
    uid = uid.concat(data.reviewSettings.thread.special.whitelistUid);
    data.users = await db.UserModel.find({uid}, {
      uid: 1,
      username: 1
    });
    await next();
  })
  .put("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {type, listType, uid, whitelist, blacklist, tab, certsId} = body;
    if(certsId) {
      for(const id of certsId) {
        const role = await db.RoleModel.findOne({_id: id});
        if(!role) ctx.throw(400, `未找到ID为${id}的证书`);
      }
      await db.SettingModel.updateOne({_id: "review"}, {
        $set: {
          "c.certsId": certsId
        }
      });
      return await next();
    }
    if(!["thread", "post"].includes(tab)) ctx.throw(400, "参数错误，服务器无法确定是发表文章还是发表回复的审核设置");
    const reviewSettings = (await db.SettingModel.findById("review")).c;
    if(type === "addUser") {
      const targetUser = await db.UserModel.findOne({uid}, {uid: 1, username: 1});
      if(!targetUser) ctx.throw(404, `未找到ID为${uid}的用户`);
      if(listType === "blacklist") {
        if(reviewSettings[tab].special.whitelistUid.includes(uid)) ctx.throw(400, "用户已存在于白名单中，无法添加到黑名单");
        const obj = {};
        obj[`c.${tab}.special.blacklistUid`] = uid;
        await db.SettingModel.updateOne({_id: "review"}, {
          $addToSet: obj
        });
      } else {
        if(reviewSettings[tab].special.blacklistUid.includes(uid)) ctx.throw(400, "用户已存在于黑名单中，无法添加到白名单");
        const obj = {};
        obj[`c.${tab}.special.whitelistUid`] = uid;
        await db.SettingModel.updateOne({_id: "review"}, {
          $addToSet: obj
        });
      }
      data.targetUser = targetUser;
    } else if(type === "removeUser") {
      if(listType === "blacklist") {
        const obj = {};
        obj[`c.${tab}.special.blacklistUid`] = uid;
        await db.SettingModel.updateOne({_id: "review"}, {
          $pull: obj
        });
      } else {
        const obj = {};
        obj[`c.${tab}.special.whitelistUid`] = uid;
        await db.SettingModel.updateOne({_id: "review"}, {
          $pull: obj
        });
      }
    } else if(type === "saveBlacklist") {
      const {notPassedA, grades, foreign} = blacklist;
      notPassedA.status = !!notPassedA.status;
      notPassedA.count = parseInt(notPassedA.count);
      foreign.count = parseInt(foreign.count);
      if(notPassedA.type !== "all" && notPassedA.type !== "some") ctx.throw(400, "type参数不正确，可能是前端兼容性问题。");
      if(notPassedA.count <= 0) ctx.throw(400, "通过的次数不能小于1");
      foreign.status = !!foreign.status;
      if(foreign.type !== "all" && foreign.type !== "some") ctx.throw(400, "type参数不正确，可能是前端兼容性问题。");
      if(foreign.count <= 0) ctx.throw(400, "通过的次数不能小于1");
      for(const grade of grades) {
        const g = await db.UsersGradeModel.findOne({_id: grade.gradeId});
        if(!g) ctx.throw(400, `在数据库中未找到ID为${grade.gradeId}的用户等级，请注意保存已填写的设置，然后刷新页面重试。`);
        grade.status = !!grade.status;
        if(!["all", "some"].includes(grade.type)) ctx.throw(400, "type参数不正确，可能是前端兼容性问题。");
        grade.count = parseInt(grade.count);
        if(grade.count <= 0) ctx.throw(400, "通过的次数不能小于1");
      }
      const obj = {};
      obj[`c.${tab}.blacklist`] = blacklist;
      await db.SettingModel.updateOne({_id: "review"}, {
        $set: obj
      });
    } else if(type === "saveWhitelist") {
      const {gradesId, certsId} = whitelist;
      const [gradesId_, certsId_]  = [[], []];
      for(const gradeId of gradesId) {
        const grade = await db.UsersGradeModel.findOne({_id: gradeId});
        if(grade) gradesId_.push(gradeId);
      }
      for(const certId of certsId) {
        const cert = await db.RoleModel.findOne({_id: certId});
        if(cert) certsId_.push(certId);
      }
      const obj = {};
      obj[`c.${tab}.whitelist`] = {
        gradesId,
        certsId
      };
      await db.SettingModel.updateOne({_id: "review"}, {
        $set: obj
      });
    }
    data.reviewSettings = (await db.SettingModel.findById("review")).c;
    await db.SettingModel.saveSettingsToRedis("review");
    await next();
  })
  .put("/keyword", async (ctx, next) => {
    const { db, body, data } = ctx;
    const { type, value } = body;
    if(type === "enable" && typeof value === "boolean") {
      await db.SettingModel.updateOne({ _id: "review" }, {
        $set: {
          "c.keyword.enable": value
        }
      });
    } else if(type === "deleteWordGroup" && typeof value === "string") {
      await db.SettingModel.updateOne({ _id: "review" }, {
        $pull: {
          "c.keyword.wordGroup": {
            id: value
          }
        }
      });
      await db.ForumModel.updateMany({}, {
        $pull: {
          "reviewSettings.keyword.rule.thread.useGroups": value,
          "reviewSettings.keyword.rule.reply.useGroups": value
        }
      });
    } else if(type === "addWordGroup" && typeof value === "object") {
      const { name, keywords, conditions } = value;
      if(!name) ctx.throw(403, "未指定组名");
      const filterEmptyKeywords = keywords.filter(keyword => !!keyword);
      if(!filterEmptyKeywords.length) ctx.throw(403, "未添加关键词");
      if(
        await db.SettingModel.findOne({
          "c.keyword.wordGroup": {
            $elemMatch: { name }
          }
        })
      ) {
        ctx.throw(403, "词组名称重复");
      }
      const newId = db.SettingModel.newObjectId().toString();
      await db.SettingModel.updateOne({ _id: "review" }, {
        $addToSet: {
          "c.keyword.wordGroup": {
            id: newId,
            name,
            keywords: filterEmptyKeywords,
            conditions
          }
        }
      });
      data.id = newId;
    } else if(type === "reviewCondition" && typeof value === "object") {
      const { id, conditions } = value;
      await db.SettingModel.updateOne(
        { _id: "review", "c.keyword.wordGroup.id": id }, 
        {
          $set: {
            "c.keyword.wordGroup.$.conditions": conditions
          }
        }
      );
    } else if(type === "addKeywords") {
      const { groupId, keyword } = value;
      const shouldAddKeyword = keyword.toLowerCase();
      const reviewSettings = await db.SettingModel.getSettings("review");
      const wordGroups = reviewSettings.keyword.wordGroup;
      const group = wordGroups.find(group => group.id === groupId);
      if(!group) {
        ctx.throw(403, "不存在此词组");
      }
      if(group.keywords.includes(shouldAddKeyword)) {
        data.added = false;
      } else {
        group.keywords.push(shouldAddKeyword);
        data.added = true;
      }
      await db.SettingModel.updateOne({ _id: "review" }, {
        "c.keyword.wordGroup": wordGroups
      });
    } else if(type === "deleteKeywords") {
      const { groupId, keyword: shouldRemoveKeyword } = value;
      const reviewSettings = await db.SettingModel.getSettings("review");
      const wordGroups = reviewSettings.keyword.wordGroup;
      const group = wordGroups.find(group => group.id === groupId);
      if(!group) {
        ctx.throw(403, "不存在此词组");
      }
      group.keywords = group.keywords.filter(keyword => keyword !== shouldRemoveKeyword);
      await db.SettingModel.updateOne({ _id: "review" }, {
        "c.keyword.wordGroup": wordGroups
      });
    } else if(type === "renameWordGroup") {
      const { id, newName } = value;
      const reviewSettings = await db.SettingModel.getSettings("review");
      const wordGroups = reviewSettings.keyword.wordGroup;
      for(group of wordGroups) {
        if(group.id === id) {
          group.name = newName;
          break;
        }
      }
      await db.SettingModel.updateOne({ _id: "review" }, {
        "c.keyword.wordGroup": wordGroups
      });
    } else if(type === "applyAllForums") {
      await db.ForumModel.updateMany({}, {
        $addToSet: {
          "reviewSettings.keyword.rule.thread.useGroups": value,
          "reviewSettings.keyword.rule.reply.useGroups": value
        }
      });
    } else if(type === "cancelApplyAllForums") {
      await db.ForumModel.updateMany({}, {
        $pull: {
          "reviewSettings.keyword.rule.thread.useGroups": value,
          "reviewSettings.keyword.rule.reply.useGroups": value
        }
      });
    } else {
      ctx.throw(403, "参数不正确");
    }
    await db.SettingModel.saveSettingsToRedis("review");
    return next();
  });
module.exports = router;
