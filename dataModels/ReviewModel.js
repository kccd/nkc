const mongoose = require("../settings/database");
const Mint = require('mint-filter').default

const Schema = mongoose.Schema;

const schema = new Schema({
  _id: Number,
  type: {
    type: "String", // disabledPost, disabledThread, returnPost, returnThread, passPost, passThread
    required: true,
    index: 1
  },
  pid: {
    type: String,
    default: "",
    index: 1
  },
  tid: {
    type: String,
    default: "",
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  handlerId: {
    type: String,
    required: true,
    index: 1
  },
  reason: {
    type: String,
    default: ""
  }
},{
  collection: "reviews"
});
/*
* 生成审核记录
* @param {String} type 审核类型
* @param {Object} post 内容
* @param {Object} user 处理人ID
* @author pengxiguaa 2019-6-3
* */
schema.statics.newReview = async (type, post, user, reason) => {
  await mongoose.model("reviews")({
    _id: await mongoose.model("settings").operateSystemID("reviews", 1),
    type,
    reason,
    pid: post.pid,
    tid: post.tid,
    uid: post.uid,
    handlerId: user.uid
  }).save();
};

const pureWordRegExp = /([^\u4e00-\u9fa5a-zA-Z0-9])/gi;
const MatchedKeyword = { result: [] };
// 文章内容是否触发了敏感词送审条件
schema.statics.includesKeyword = async (post) => {
  const { t, c, mainForumsId } = post;
  const targetFid = mainForumsId[0];
  // 拿到目标专业中对敏感词词组的设置
  const ForumModel = mongoose.model("forums");
  const { keywordReviewUseGroup } = await ForumModel.findOne({ fid: targetFid }, { keywordReviewUseGroup: 1 });   // id数组
  // 拿到全局的敏感词设置
  const SettingModel = mongoose.model("settings");
  const reviewSetting = await SettingModel.getSettings("review");
  const keywordSetting = reviewSetting.keyword;
  if(!keywordSetting) return false;
  if(!keywordSetting.enable) return false;
  const wordGroup = keywordSetting.wordGroup;
  if(!wordGroup.length) return false;
  // 把对应词组的敏感词聚合到一个数组中
  let keywordList = [];
  wordGroup.forEach(group => {
    const { id, keywords } = group;
    if(keywordReviewUseGroup.includes(id)) {
      keywordList = keywordList.concat(keywords);
    }
  });
  // 把待检测文本聚合起来并提取纯文字（无标点符号和空格）
  const content = (t + c).replace(pureWordRegExp, "").toLowerCase();
  // 同样的，把配置的敏感词也提取纯文字
  keywordList = keywordList.map(keyword => keyword.replace(pureWordRegExp, "").toLowerCase());
  // 读取判断逻辑配置
  const { leastKeywordTimes, leastKeywordCount, relationship } = keywordSetting.condition;
  // 开始检测
  const mint = new Mint(keywordList);
  const contentFilterValue = await mint.filter(content, { replace: false });
  // 保存结果
  MatchedKeyword.result = [].slice.call(contentFilterValue.words);
  // 开始分析检测结果
  if(contentFilterValue.pass) return false;
  // 命中敏感词个数
  const hitWordsCount = contentFilterValue.words.length;
  // 总命中次数
  let hitCount = 0;
  contentFilterValue.words.forEach(word => {
    hitCount += (content.match(new RegExp(word, "g")) || []).length;
  });
  if(relationship === "or") {
    if(hitWordsCount >= leastKeywordCount || hitCount >= leastKeywordTimes) return true;
  } else if(relationship === "and") {
    if(hitWordsCount >= leastKeywordCount && hitCount >= leastKeywordTimes) return true;
  }
  return false;
}

// 检测post内容和post相关的用户和专业信息，判断是否需要送审，需要的话会自动更改状态并创建记录
schema.statics.autoPushToReview = async function(post) {
  const { type, uid, pid, tid } = post;
  const ReviewModel = mongoose.model("reviews");
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const PostModel = mongoose.model("posts");
  const UsersPersonalModel = mongoose.model("usersPersonal");
  const SettingModel = mongoose.model("settings");
  const ForumModel = mongoose.model("forums");
  const recycleId = await SettingModel.getRecycleId();

  const user = await UserModel.findOne({uid});
  if(!user) throwErr(500, "在判断内容是否需要审核的时候，发现未知的uid");
  const reviewSettings = (await SettingModel.findById("review")).c;
  const review = reviewSettings[type];

  const needReview = (async () => {
    // 一、特殊限制
    const {whitelistUid, blacklistUid} = review.special;
    // 1. 白名单
    if(whitelistUid.includes(uid)) {
      return false
    }
    // 2. 黑名单
    if(blacklistUid.includes(uid)) {
      await ReviewModel.newReview("blacklist", post, user, "黑名单中的用户");
      return true
    }

    // 二、白名单（用户证书和用户等级）
    const {gradesId, certsId} = review.whitelist;
    await user.extendGrade();
    if(gradesId.includes(user.grade._id)) {
      return false
    }
    await user.extendRoles();
    for(const role of user.roles) {
      if(certsId.includes(role._id)) {
        return false
      }
    }

    // 三、黑名单（海外手机号、未通过A卷和用户等级）
    let passedCount = 0;
    if(type === "post") {
      passedCount = await PostModel.count({
        disabled: false,
        reviewed: true,
        uid
      });
    } else {
      passedCount = await ThreadModel.count({
        disabled: false,
        reviewed: true,
        mainForumsId: {$ne: recycleId},
        uid
      });
    }
    const {grades, notPassedA, foreign} = review.blacklist;
    const userPersonal = await UsersPersonalModel.findOnly({uid});

    // 开启了海外手机号用户发表需审核
    // 用户绑定了海外手机号
    // 用户通过审核的数量小于设置的数量
    // 满足的用户所发表的文章 需要审核
    if(foreign.status && userPersonal.nationCode !== "86") {
      if(foreign.type === "all" || foreign.count > passedCount) {
        await ReviewModel.newReview("foreign", post, user, "海外手机号用户，审核通过的文章数量不足");
        return true
      }
    }

    // 开启了未通过A卷考试的用户发表需审核
    // 用户没有通过A卷考试
    // 用户通过审核的数量小于设置的数量
    // 满足以上的用户所发表的文章 需要审核
    if(notPassedA.status && !user.volumeA) {
      if(notPassedA.type === "all" || notPassedA.count > passedCount) {
        await ReviewModel.newReview("notPassedA", post, user, "用户没有通过A卷考试，审核通过的文章数量不足");
        return true;
      }
    }

    let grade;
    for(const g of grades) {
      if(g.gradeId === user.grade._id) {
        grade = g;
      }
    }
    if(!grade) throwErr(500, "系统无法确定您账号的等级信息，请点击页脚下的报告问题，告知网站管理员。");
    if(grade.status) {
      // 目前调取的地方都在发表相应内容之后，所以用户已发表内容的数量需要-1
      if(grade.type === "all" || grade.count > passedCount - 1) {
        await ReviewModel.newReview("grade", post, user, "因用户等级限制，审核通过的文章数量不足");
        return true;
      }
    }

    // 四、未验证手机号码的用户发表文章要送审
    if(await UsersPersonalModel.shouldVerifyPhoneNumber(uid)) {
      await ReviewModel.newReview("unverifiedPhone", post, user, "用户未验证手机号");
      return true;
    }

    // 五、敏感词
    if(await ReviewModel.includesKeyword(post)) {
      await ReviewModel.newReview("includesKeyword", post, user, `内容中包含敏感词 ${MatchedKeyword.result.join("、")}`);
      return true;
    }

    // 六、专业内设置是否送审
    const fid = post.mainForumsId[0];
    const forum = await ForumModel.findOne({ fid });
    if(forum.allContentShouldReview) {
      await ReviewModel.newReview("forumSettingReview", post, user, `此专业(fid:${fid}, name:${forum.displayName})设置所有内容送审`);
      return true;
    }
    const roleGradeReview = forum.roleGradeReview;
    if(!roleGradeReview) return false;
    await user.extendRoles();
    await user.extendGrade();
    const userCerts = user.roles.map(role => role._id);
    const userGrade = user.grade._id;
    if(roleGradeReview.relationship === "and") {
      if(includesArrayElement(userCerts, roleGradeReview.roles) && roleGradeReview.grades.includes(userGrade)) {
        await ReviewModel.newReview("forumSettingReview", post, user, `此专业(fid:${fid}, name:${forum.displayName})设置内容送审，满足角色和等级关系而被送审`);
        return true;
      }
    } else if(roleGradeReview.relationship === "or") {
      if(includesArrayElement(userCerts, roleGradeReview.roles) || roleGradeReview.grades.includes(userGrade)) {
        await ReviewModel.newReview("forumSettingReview", post, user, `此专业(fid:${fid}, name:${forum.displayName})设置内容送审，满足角色和等级关系而被送审`);
        return true;
      }
    }
    return false
  })();

  // 如果不需要审核，更改状态为已审核通过
  if(!needReview) {
    await PostModel.updateOne({pid}, {$set: {reviewed: true}});
  }

  return needReview;
}

module.exports = mongoose.model("reviews", schema);



// 目标数组中是否包含给定数组中任意一个元素
function includesArrayElement(target, arr) {
  for(const el of arr) {
    if(target.includes(el)) return true;
  }
  return false;
}
