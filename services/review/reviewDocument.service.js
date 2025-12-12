const DocumentModel = require('../../dataModels/DocumentModel');
const KcbsRecordModel = require('../../dataModels/KcbsRecordModel');
const UsersScoreLogModel = require('../../dataModels/UsersScoreLogModel');
const UserModel = require('../../dataModels/UserModel');
const DelPostLogModel = require('../../dataModels/DelPostLogModel');
const socket = require('../../nkcModules/socket');
const MessageModel = require('../../dataModels/MessageModel');
const SettingModel = require('../../dataModels/SettingModel');
const ColumnPostModel = require('../../dataModels/ColumnPostModel');
const ColumnModel = require('../../dataModels/ColumnModel');
const MomentModel = require('../../dataModels/MomentModel');
const ArticleModel = require('../../dataModels/ArticleModel');
const CommentModel = require('../../dataModels/CommentModel');
const apiFunction = require('../../nkcModules/apiFunction');
const ColumnContributeModel = require('../../dataModels/ColumnContributeModel');
const { getJsonStringTextSlice } = require('../../nkcModules/json');
const {
  documentStatus,
  documentTypes,
  documentSources,
} = require('../../settings/document');
const { userInfoService } = require('../user/userInfo.service');
const { reviewFinderService } = require('./reviewFinder.service');
const { reviewSources } = require('../../settings/review');
const { reviewModifierService } = require('./reviewModifier.service');
const { momentQuoteTypes } = require('../../settings/moment');
const IPModel = require('../../dataModels/IPModel');
const { commentStatus } = require('../../settings/comment');
const { getMomentPublishType } = require('../../events/moment');
const { eventEmitter } = require('../../events');
class ReviewDocumentService {
  getPendingReviewDocuments = async (props) => {
    const { page, perPage } = props;
    const match = {
      status: documentStatus.unknown,
      type: documentTypes.stable,
      source: {
        $in: [
          documentSources.article,
          documentSources.comment,
          documentSources.moment,
        ],
      },
    };
    const documentCount = await DocumentModel.countDocuments(match);
    const paging = apiFunction.paging(page, documentCount, perPage);
    const documents = await DocumentModel.find(match, {
      _id: 1,
      uid: 1,
      did: 1,
      toc: 1,
      title: 1,
      content: 1,
      sid: 1,
      source: 1,
      l: 1,
    })
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const articleDocId = new Set();
    const commentDocId = new Set();
    const momentDocId = new Set();
    const documentIds = new Set();
    const usersId = new Set();
    for (const document of documents) {
      document.content =
        document.l === 'json'
          ? getJsonStringTextSlice(document.content, 100)
          : apiFunction.obtainPureText(document.content, true, 100);
      if (document.source === documentSources.article) {
        articleDocId.add(document.did);
      }
      if (document.source === documentSources.comment) {
        commentDocId.add(document.did);
      }
      if (document.source === documentSources.moment) {
        momentDocId.add(document.did);
      }
      usersId.add(document.uid);
      documentIds.add(document._id.toString());
    }
    const moments = await MomentModel.find({ did: { $in: [...momentDocId] } });
    const extendedMoments = await MomentModel.extendMomentsData(
      moments,
      '',
      'did',
    );
    const articles = await ArticleModel.find({
      did: { $in: [...articleDocId] },
    });
    const extendedArticles = await ArticleModel.extendArticles(articles);
    const comments = await CommentModel.find({
      did: { $in: [...commentDocId] },
    });
    const extendedComments = await CommentModel.extendReviewComments(comments);
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds([
      ...usersId,
    ]);
    const articlesMap = new Map();
    for (const article of extendedArticles) {
      articlesMap.set(article.did, article);
    }
    const commentsMap = new Map();
    for (const comment of extendedComments) {
      commentsMap.set(comment.did, comment);
    }
    const momentsMap = new Map();
    for (const moment of Object.values(extendedMoments)) {
      momentsMap.set(moment.did, moment);
    }
    const reviewReasonMap = await reviewFinderService.getReviewReasonsMap(
      reviewSources.document,
      [...documentIds],
    );
    const results = [];
    for (const document of documents) {
      const user = usersObject[document.uid];
      const article = articlesMap.get(document.did);
      const comment = commentsMap.get(document.did);
      const moment = momentsMap.get(document.did);
      const reviewReason = reviewReasonMap.get(document._id.toString()) || '';

      if (
        !user ||
        (document.source === documentSources.article && !article) ||
        (document.source === documentSources.comment && !comment) ||
        (document.source === documentSources.moment && !moment)
      ) {
        continue;
      }

      results.push({
        type: 'document',
        document,
        content: article || comment || moment,
        user,
        reason: reviewReason,
      });
    }
    return {
      data: results,
      paging,
    };
  };

  // 处理专栏文章的投稿
  #handleColumnArticleContribution = async (props) => {
    const { document } = props;
    // 专栏文章审核通过，更新文章的审核状态
    // 接下来处理专栏投稿
    const contribute = await ColumnContributeModel.findOne({
      tid: document.sid,
      type: 'submit',
    }).sort({ toc: -1 });
    if (!contribute || contribute.passed !== 'unknown') {
      return;
    }
    // 是否具有专栏管理员添加文章权限或者专栏主
    // 获取专栏的基本信息。。与用户的信息进行对比
    const column = await ColumnModel.findOnly({
      _id: contribute.columnId,
    });
    const userPermissionObject =
      await ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await ColumnModel.checkUsersPermission(
      column.users,
      document.uid,
      userPermissionObject.column_post_add,
    );
    if (isPermission || column.uid === document.uid) {
      const article = await ArticleModel.findOne({
        _id: document.sid,
      });
      let columnPost = await ColumnPostModel.findOne({
        pid: document.sid,
        type: 'article',
        columnId: column._id,
      });
      if (!columnPost) {
        await ColumnPostModel({
          _id: await SettingModel.operateSystemID('columnPosts', 1),
          tid: '',
          from: 'contribute',
          pid: article._id,
          columnId: column._id,
          type: contribute.source,
          order: await ColumnPostModel.getColumnPostOrder(
            contribute.cid,
            contribute.mcid,
          ),
          top: article.toc,
          cid: contribute.cid,
          mcid: contribute.mcid,
        }).save();
      }
      // 需要进行更新article中sid
      let sidArray = [];
      const columnPostArray = await ColumnPostModel.find({
        pid: article._id,
        type: 'article',
      });
      for (const columnPostItem of columnPostArray) {
        sidArray.push(columnPostItem.columnId);
      }
      sidArray = [...new Set(sidArray)];
      await article.updateOne({ $set: { sid: sidArray.join('-') } });
      await contribute.updateOne({
        tlm: Date.now(),
        description: '具有专栏添加文章权限',
        passed: 'resolve',
      });
    } else {
      await contribute.updateOne({
        tlm: Date.now(),
        passed: 'pending',
      });
    }
  };

  markDocumentReviewStatus = async (props) => {
    const { document: documentProps, ctx } = props;
    // approve, disabled, faulty
    const {
      docId,
      operation,
      reason,
      remindUser, // 是否提醒用户
      violation, // 是否标记违规
    } = documentProps;

    const document = await DocumentModel.findOne({
      _id: docId,
      status: documentStatus.unknown,
    });
    if (!document) {
      return;
    }

    if (operation === 'approve') {
      await document.setStatus(documentStatus.normal);
      await reviewModifierService.modifyReviewLogStatusToApproved({
        source: reviewSources.document,
        sid: document._id.toString(),
        handlerId: ctx.state.uid,
        handlerReason: '', // 通过审核无需理由
      });
      if (
        momentQuoteTypes[document.source] &&
        document.source !== documentSources.moment
      ) {
        // 生成引用电文
        const ip = await IPModel.getIpByIpId(document.ip);
        MomentModel.createQuoteMomentAndPublish({
          ip,
          port: document.port,
          uid: document.uid,
          quoteType: momentQuoteTypes[document.source],
          quoteId: document.sid,
        }).catch(console.error);
      }
      let passType = '';
      if (document.source === documentSources.article) {
        passType = 'documentPassReview';
        await this.#handleColumnArticleContribution({ document });
      } else if (document.source === documentSources.comment) {
        //如果审核的内容是comment,并且是第一次审核，即判断document的状态是否为unknown,就通知文章作者文章被评论
        passType = 'commentPassReview';
        const comment = await CommentModel.findOnly({ _id: document.sid });
        if (comment.status === commentStatus.normal) {
          //通知作者，内容过审
          await comment.noticeAuthorComment();
        }
      } else if (document.source === documentSources.moment) {
        passType = 'momentPass';
        const { momentBubble } = getMomentPublishType();
        await eventEmitter.emit(momentBubble, {
          uid: document.uid,
          momentId: document.sid,
        });
      }

      const message = await MessageModel({
        _id: await SettingModel.operateSystemID('messages', 1),
        r: document.uid,
        ty: 'STU',
        c: {
          type: passType,
          docId: document._id,
        },
      });
      await message.save();
      await socket.sendMessageToUser(message._id);
      await document.sendMessageToAtUsers('article');
    } else {
      // 未通过审核
      if (operation === 'disabled') {
        await document.setStatus(documentStatus.disabled);
        await reviewModifierService.modifyReviewLogStatusToDeleted({
          source: reviewSources.document,
          sid: document._id.toString(),
          handlerId: ctx.state.uid,
          handlerReason: reason,
        });
      } else {
        await document.setStatus(documentStatus.faulty);
        await reviewModifierService.modifyReviewLogStatusToRevised({
          source: reviewSources.document,
          sid: document._id.toString(),
          handlerId: ctx.state.uid,
          handlerReason: reason,
        });
      }
      //生成退修或删除记录
      const delLog = DelPostLogModel({
        delUserId: document.uid,
        userId: ctx.state.uid,
        delPostTitle: document ? document.title : '',
        reason,
        postType: document.source,
        threadId: document.sid,
        postId: document._id,
        delType: operation === 'disabled' ? 'disabled' : 'toDraft',
        noticeType: remindUser,
      });
      await delLog.save();

      // 违规
      if (violation) {
        const targetUser = await UserModel.findOnly({ uid: document.uid });
        await UsersScoreLogModel.insertLog({
          user: targetUser,
          type: 'score',
          typeIdOfScoreChange: 'violation',
          port: ctx.port,
          ip: ctx.address,
          key: 'violationCount',
          description: reason || '屏蔽文档并标记为违规',
        });
        await KcbsRecordModel.insertSystemRecord('violation', targetUser, ctx);
      }
      // 通知用户
      if (remindUser) {
        let messageType;
        if (document.source === 'article') {
          messageType =
            operation === 'faulty' ? 'documentFaulty' : 'documentDisabled';
        } else if (document.source === 'comment') {
          messageType =
            operation === 'faulty' ? 'commentFaulty' : 'commentDisabled';
        } else if (document.source === 'moment') {
          messageType = 'momentDelete';
        }
        const message = MessageModel({
          _id: await SettingModel.operateSystemID('messages', 1),
          r: document.uid,
          ty: 'STU',
          c: {
            operation,
            violation, //是否违规
            type: messageType,
            docId: document._id,
            reason,
          },
        });
        await message.save();
        await socket.sendMessageToUser(message._id);
      }
    }
  };
}

module.exports = {
  reviewDocumentService: new ReviewDocumentService(),
};
