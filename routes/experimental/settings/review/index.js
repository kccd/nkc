const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) =>{
    const {data, db} = ctx;
    ctx.template = "experimental/settings/review/review.pug";
    data.grades = await db.UsersGradeModel.find({}).sort({_id: 1});
    data.reviewSettings = (await db.SettingModel.findById("review")).c;
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
      await db.SettingModel.update({ _id: "review" }, {
        $set: {
          "c.keyword.enable": value
        }
      });
    } else if(type === "deleteWordGroup" && typeof value === "string") {
      await db.SettingModel.updateOne({ _id: "review" }, {
        $pull: {
          "c.keyword.wordGroup": {
            name: value
          }
        }
      });
    } else if(type === "addWordGroup" && typeof value === "object") {
      const { name, keywords } = value;
      if(!name) ctx.throw(403, "未指定组名");
      if(!keywords.length) ctx.throw(403, "未添加关键词");
      if(
        await db.SettingModel.findOne({
          "c.keyword.wordGroup": { 
            $elemMatch: { name }
          }
        })
      ) {
        ctx.throw(403, "词组名称重复");
      }
      await db.SettingModel.update({ _id: "review" }, {
        $addToSet: {
          "c.keyword.wordGroup": {
            name,
            keywords
          }
        }
      });
    } else if(type === "reviewCondition" && typeof value === "object") {
      const { leastKeywordTimes, leastKeywordCount, relationship } = value;
      await db.SettingModel.update({ _id: "review" }, {
        "c.keyword.condition": {
          leastKeywordTimes: leastKeywordTimes || 1,
          leastKeywordCount: leastKeywordCount || 1,
          relationship: relationship || "or"
        }
      });
    } else if(type === "addKeywords") {
      const { name, keywords } = value;
      const reviewSettings = await db.SettingModel.getSettings("review");
      const wordGroups = reviewSettings.keyword.wordGroup;
      const addedKeywords = [];
      for(group of wordGroups) {
        if(group.name === name) {
          const keywordsSet = new Set(group.keywords);
          keywords.forEach(keyword => {
            const beforeSize = keywordsSet.size;
            keywordsSet.add(keyword);
            const afterSize = keywordsSet.size;
            if(afterSize > beforeSize) {
              addedKeywords.push(keyword);
            }
          });
          group.keywords = Array.from(keywordsSet)
          break;
        }
      }
      data.added = addedKeywords;
      await db.SettingModel.update({ _id: "review" }, {
        "c.keyword.wordGroup": wordGroups
      });
    } else if(type === "deleteKeywords") {
      const { name, keywords } = value;
      const reviewSettings = await db.SettingModel.getSettings("review");
      const wordGroups = reviewSettings.keyword.wordGroup;
      const shouldDelete = [];
      for(group of wordGroups) {
        if(group.name === name) {
          group.keywords = group.keywords.filter(keyword => {
            if(keywords.includes(keyword)) {
              shouldDelete.push(keyword);
              return false;
            }
            return true;
          });
          break;
        }
      }
      data.deleted = shouldDelete;
      await db.SettingModel.update({ _id: "review" }, {
        "c.keyword.wordGroup": wordGroups
      });
    }
    await db.SettingModel.saveSettingsToRedis("review");
    return next();
  });
module.exports = router;
