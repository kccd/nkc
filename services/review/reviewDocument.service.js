const DocumentModel = require('../../dataModels/DocumentModel');
const MomentModel = require('../../dataModels/MomentModel');
const ArticleModel = require('../../dataModels/ArticleModel');
const CommentModel = require('../../dataModels/CommentModel');
const apiFunction = require('../../nkcModules/apiFunction');
const { getJsonStringTextSlice } = require('../../nkcModules/json');
const {
  documentStatus,
  documentTypes,
  documentSources,
} = require('../../settings/document');
const { userInfoService } = require('../user/userInfo.service');
const { reviewFinderService } = require('./reviewFinder.service');
const { reviewSources } = require('../../settings/review');
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
      documentIds.add(document._id);
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
      const reviewReason = reviewReasonMap.get(document._id) || '';

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
}

module.exports = {
  reviewDocumentService: new ReviewDocumentService(),
};
