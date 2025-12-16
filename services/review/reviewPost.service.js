const SettingModel = require('../../dataModels/SettingModel');
const socket = require('../../nkcModules/socket');
const MessageModel = require('../../dataModels/MessageModel');
const IPModel = require('../../dataModels/IPModel');
const MomentModel = require('../../dataModels/MomentModel');
const ThreadModel = require('../../dataModels/ThreadModel');
const ForumModel = require('../../dataModels/ForumModel');
const { getJsonStringText } = require('../../nkcModules/json');
const UserModel = require('../../dataModels/UserModel');
const UsersPersonalModel = require('../../dataModels/UsersPersonalModel');
const PostModel = require('../../dataModels/PostModel');
const { settingIds } = require('../../settings/serverSettings');
const { reviewTriggerType, reviewSources } = require('../../settings/review');
const { keywordCheckerService } = require('../keyword/keywordChecker.service');
const { reviewCheckerService } = require('./reviewChecker.service');
const { reviewCreatorService } = require('./reviewCreator.service');
const apiFunction = require('../../nkcModules/apiFunction');
const { userInfoService } = require('../user/userInfo.service');
const { reviewFinderService } = require('./reviewFinder.service');
const tools = require('../../nkcModules/tools');
const { reviewModifierService } = require('./reviewModifier.service');

class ReviewPostService {
  getGlobalPostReviewStatus = async (post) => {
    const { type, uid } = post;
    const publishSettings = await SettingModel.getSettings(settingIds.publish);
    const { postReview } = publishSettings[type];
    const recycleId = await SettingModel.getRecycleId();

    const user = await UserModel.findOne({ uid });
    if (!user) {
      throw new Error(`数据异常，uid: ${uid}`);
    }
    let passedCount = 0;
    if (type === 'post') {
      passedCount = await PostModel.countDocuments({
        disabled: false,
        reviewed: true,
        uid,
      });
    } else {
      passedCount = await ThreadModel.countDocuments({
        disabled: false,
        reviewed: true,
        mainForumsId: { $ne: recycleId },
        uid,
      });
    }
    const { nationCode } = await UsersPersonalModel.getUserPhoneNumber(uid);
    const { foreign, notPassVolumeA, notPassVolumeAD, whitelist, blacklist } =
      postReview;

    const roles = await user.extendRoles();
    const grade = await user.extendGrade();
    const roleList = roles.map((r) => `role-${r._id}`);
    roleList.push(`grade-${grade._id}`);
    // 白名单（用户证书和用户等级）
    for (const r of roleList) {
      if (whitelist.includes(r)) {
        return {
          needReview: false,
          type: '',
          reason: '',
        };
      }
    }
    // 海外手机号注册用户
    if (
      nationCode !== foreign.nationCode &&
      (foreign.type === 'all' ||
        (foreign.type === 'count' && passedCount < foreign.count))
    ) {
      return {
        needReview: true,
        type: reviewTriggerType.foreign,
        reason: '',
      };
    }

    // 未通过AD卷(入学)考试
    if (
      !user.volumeAD &&
      (notPassVolumeAD.type === 'all' ||
        (notPassVolumeAD.type === 'count' &&
          passedCount < notPassVolumeAD.count))
    ) {
      return {
        needReview: true,
        type: reviewTriggerType.notPassedAD,
        reason: '',
      };
    }

    // 未通过 A 卷考试
    if (
      !user.volumeA &&
      (notPassVolumeA.type === 'all' ||
        (notPassVolumeA.type === 'count' && passedCount < notPassVolumeA.count))
    ) {
      return {
        needReview: true,
        type: reviewTriggerType.notPassedA,
        reason: '',
      };
    }

    // 黑名单（用户证书和用户等级）
    for (const bl of blacklist) {
      if (!roleList.includes(bl.id) || bl.type === 'none') {
        continue;
      }
      if (
        bl.type === 'all' ||
        (bl.type === 'count' && passedCount < bl.count)
      ) {
        return {
          needReview: true,
          type: reviewTriggerType.grade,
          reason: '',
        };
      }
    }

    // 专业审核设置了敏感词
    const fid = post.mainForumsId[0];
    const forum = await ForumModel.findOne({ fid });
    const currentPostType = post.type;
    const forumReviewSettings = forum.reviewSettings;
    const forumKeywordSettings = forumReviewSettings.keyword;
    if (
      (forumKeywordSettings.range === 'only_thread' &&
        currentPostType === 'thread') ||
      (forumKeywordSettings.range === 'only_reply' &&
        currentPostType === 'post') ||
      forumKeywordSettings.range === 'all'
    ) {
      let useKeywordGroupsId = [];
      if (currentPostType === 'thread') {
        useKeywordGroupsId = forumKeywordSettings.rule.thread.useGroups;
      }
      if (currentPostType === 'post') {
        useKeywordGroupsId = forumKeywordSettings.rule.reply.useGroups;
      }
      const matchedKeywords =
        await keywordCheckerService.matchKeywordsByGroupsId(
          post.t + (post.l === 'json' ? getJsonStringText(post.c) : post.c),
          useKeywordGroupsId,
        );
      if (matchedKeywords.length > 0) {
        return {
          needReview: true,
          type: reviewTriggerType.sensitiveWord,
          reason: `${matchedKeywords.join('、')}`,
        };
      }
    }
    //专业审核设置了送审规则（按角色和等级的关系送审）
    const forumContentSettings = forumReviewSettings.content;
    if (
      (forumContentSettings.range === 'only_thread' &&
        currentPostType === 'thread') ||
      (forumContentSettings.range === 'only_reply' &&
        currentPostType === 'post') ||
      forumContentSettings.range === 'all'
    ) {
      let roleList = [],
        gradeList = [],
        relationship = 'or';
      if (currentPostType === 'thread') {
        if (forumContentSettings.rule.thread.anyone) {
          return {
            needReview: true,
            type: reviewTriggerType.forumSettingReview,
            reason: ``,
          };
        }
        roleList = forumContentSettings.rule.thread.roles;
        gradeList = forumContentSettings.rule.thread.grades;
        relationship = forumContentSettings.rule.thread.relationship;
      }
      if (currentPostType === 'post') {
        if (forumContentSettings.rule.reply.anyone) {
          return {
            needReview: true,
            type: reviewTriggerType.forumSettingReview,
            reason: ``,
          };
        }
        roleList = forumContentSettings.rule.reply.roles;
        gradeList = forumContentSettings.rule.reply.grades;
        relationship = forumContentSettings.rule.reply.relationship;
      }

      await user.extendRoles();
      await user.extendGrade();
      const userRolesId = user.roles.map((role) => role._id);
      const userGrade = user.grade._id;
      const isSome = userRolesId.some((roleId) => roleList.includes(roleId));
      if (relationship === 'and') {
        if (isSome && gradeList.includes(userGrade)) {
          return {
            needReview: true,
            type: reviewTriggerType.forumSettingReview,
            reason: ``,
          };
        }
      } else if (relationship === 'or') {
        if (isSome || gradeList.includes(userGrade)) {
          return {
            needReview: true,
            type: reviewTriggerType.forumSettingReview,
            reason: ``,
          };
        }
      }
    }

    // 验证手机号
    const verifyPhoneNumberReviewStatus =
      await reviewCheckerService.getVerifyPhoneNumberReviewStatus(uid);
    if (verifyPhoneNumberReviewStatus.needReview) {
      return verifyPhoneNumberReviewStatus;
    }

    // 全局发表敏感词
    const { keywordGroupId } = postReview;
    const {
      c = '',
      t = '',
      abstractCn = '',
      abstractEn = '',
      keyWordsCn = [],
      keyWordsEn = [],
    } = post;
    const Content =
      (post.l === 'json' ? getJsonStringText(c) : c) +
      t +
      abstractCn +
      abstractEn +
      keyWordsCn.concat(keyWordsEn).join(' ');
    const matchedKeywords = await keywordCheckerService.matchKeywordsByGroupsId(
      Content,
      keywordGroupId,
    );
    if (matchedKeywords.length > 0) {
      return {
        needReview: true,
        type: reviewTriggerType.sensitiveWord,
        reason: `${matchedKeywords.join('、')}`,
      };
    }

    return {
      needReview: false,
      type: '',
      reason: '',
    };
  };

  // 获取审核状态，如果需要审核则创建一条待审核记录
  getReviewStatusAndCreateReviewLog = async (post) => {
    const reviewStatus = await this.getGlobalPostReviewStatus(post);
    if (reviewStatus.needReview) {
      await reviewCreatorService.createPostReviewLog({
        uid: post.uid,
        postId: post.pid,
        triggerType: reviewStatus.type,
        triggerReason: reviewStatus.reason,
      });
    }
    return reviewStatus;
  };

  // 获取待审核的post
  getPendingReviewPosts = async (props) => {
    const { page, perPage, isSuperModerator, user } = props;
    const match = {
      reviewed: false,
      disabled: false,
    };
    // 通过专业过滤
    // 专家仅能审核自己专业的内容
    // 超级专家则可以审核全站
    if (!isSuperModerator) {
      const forums = await ForumModel.find(
        { moderators: user.uid },
        { fid: 1 },
      );
      match.mainForumsId = forums.map((f) => f.fid);
    }
    const postCount = await PostModel.countDocuments(match);
    const paging = await apiFunction.paging(page, postCount, perPage);
    const posts = await PostModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perPage);
    const postsId = new Set();
    const threadsId = new Set();
    const usersId = new Set();
    for (const post of posts) {
      postsId.add(post.pid);
      threadsId.add(post.tid);
      usersId.add(post.uid);
    }
    const threads = await ThreadModel.find({
      tid: { $in: [...threadsId] },
    });
    const extendedThreads = await ThreadModel.extendThreads(threads, {
      lastPost: false,
      lastPostUser: false,
      forum: true,
      category: false,
      firstPostResource: false,
    });
    const extendedThreadsMap = new Map();
    for (const extendedThread of extendedThreads) {
      extendedThreadsMap.set(extendedThread.tid, extendedThread);
    }
    const extendedPosts = await PostModel.extendPosts(posts, {
      uid: user ? user.uid : '',
      visitor: user,
    });
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds([
      ...usersId,
    ]);
    const reviewReasonsMap = await reviewFinderService.getReviewReasonsMap(
      reviewSources.post,
      [...postsId],
    );
    const results = [];
    for (const post of extendedPosts) {
      const thread = extendedThreadsMap.get(post.tid);
      const user = usersObject[post.uid];
      const reviewReason = reviewReasonsMap.get(post.pid) || '';
      if (post.type === 'thread') {
        if (thread.recycleMark) {
          continue;
        }
      }
      results.push({
        post,
        thread,
        user,
        reason: reviewReason,
        type: post.type,
        link: tools.getUrl('post', post.pid),
      });
    }

    return {
      data: results,
      paging,
    };
  };

  // 标记审核为通过
  markPostReviewAsApproved = async (props) => {
    const { uid, postsId, isSuperModerator } = props;
    const match = {
      pid: { $in: postsId },
      reviewed: false,
    };
    if (!isSuperModerator) {
      const forums = await ForumModel.find({ moderators: uid }, { fid: 1 });
      match.mainForumsId = forums.map((f) => f.fid);
    }
    const momentQuoteTypes = await MomentModel.getMomentQuoteTypes();
    const posts = await PostModel.find(match);
    for (const post of posts) {
      await post.updateOne({
        reviewed: true,
      });
      const ip = await IPModel.getIpByIpId(post.ipoc);
      // 创建引用内容的电文
      MomentModel.createQuoteMomentAndPublish({
        ip,
        uid: post.uid,
        quoteType: momentQuoteTypes.post,
        quoteId: post.pid,
      }).catch(console.error);
      // 更新文章信息
      const thread = await ThreadModel.findOne({ tid: post.tid });
      if (thread.oc === post.pid) {
        await thread.updateOne({ reviewed: true });
      } else {
        // 通知回复所在文章作者，文章有了新回复
        await post.noticeAuthorReply();
      }
      await thread.updateThreadMessage(false);
      // 修改审核记录状态为已通过
      await reviewModifierService.modifyReviewLogStatusToApproved({
        source: reviewSources.post,
        sid: post.pid,
        handlerId: uid,
        handlerReason: '',
      });
      // 发送审核通过通知
      const message = await MessageModel({
        _id: await SettingModel.operateSystemID('messages', 1),
        r: post.uid,
        ty: 'STU',
        c: {
          type: 'passReview',
          pid: post.pid,
        },
      });
      await message.save();
      await socket.sendMessageToUser(message._id);
    }
  };
}

module.exports = {
  reviewPostService: new ReviewPostService(),
};
