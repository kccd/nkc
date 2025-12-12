const ReviewLogModel = require('../../dataModels/ReviewLogModel');
const { getJsonStringTextSplit } = require('../../nkcModules/json');
const { htmlToPlain } = require('../../nkcModules/nkcRender');
const { threadFinderService } = require('../thread/threadFinder.service');
const apiFunction = require('../../nkcModules/apiFunction');
const { translateReview } = require('../../nkcModules/translate');
const { reviewStatus, reviewSources } = require('../../settings/review');
const { documentFinderService } = require('../document/documentFinder.service');
const { getUrl } = require('../../nkcModules/tools');
const {
  noteContentFinderService,
} = require('../note/noteContentFinder.service');
const { postFinderService } = require('../post/postFinder.service');
const { userInfoService } = require('../user/userInfo.service');
const { documentSources } = require('../../settings/document');
class ReviewFinderService {
  #extendReason = (triggerType, triggerReason) => {
    // TODO: 添加多语言支持时，替换这里的lang
    const lang = 'zh_cn';
    return translateReview(lang, triggerType, [triggerReason]);
  };

  #extendContentAbstract = (l, content) => {
    return l === 'json'
      ? getJsonStringTextSplit(content, 100)
      : htmlToPlain(content, 100);
  };

  // 指定来源和来源ID，获取最近一次的审核理由说明
  getReviewReason = async (source, sid) => {
    const log = await ReviewLogModel.findOne(
      {
        sid,
        source,
      },
      {
        triggerType: 1,
        triggerReason: 1,
      },
    ).sort({ toc: -1 });
    let reason = '';
    if (log) {
      reason = this.#extendReason(log.triggerType, log.triggerReason);
    }
    return reason;
  };

  getReviewReasonsMap = async (source, sourcesId) => {
    const reviewLogs = await ReviewLogModel.find(
      {
        source,
        sid: { $in: sourcesId },
        status: reviewStatus.pending,
      },
      {
        sid: 1,
        triggerType: 1,
        triggerReason: 1,
      },
    ).sort({ toc: -1 });

    const reasonsMap = new Map();
    for (const log of reviewLogs) {
      if (!reasonsMap.has(log.sid)) {
        const reason = this.#extendReason(log.triggerType, log.triggerReason);
        reasonsMap.set(log.sid, reason);
      }
    }
    return reasonsMap;
  };

  // 后台管理获取审核记录
  managerGetReviewLogs = async (props) => {
    const { page, perPage } = props;
    const count = await ReviewLogModel.countDocuments();
    const paging = apiFunction.paging(page, count, perPage);
    const reviewLogs = await ReviewLogModel.find()
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const usersId = new Set();
    const postsId = new Set();
    const documentsId = new Set();
    const noteContentsId = new Set();
    for (const reviewLog of reviewLogs) {
      usersId.add(reviewLog.uid);
      if (reviewLog.handlerId) {
        usersId.add(reviewLog.handlerId);
      }
      if (reviewLog.source === reviewSources.post) {
        postsId.add(reviewLog.sid);
      } else if (reviewLog.source === reviewSources.document) {
        documentsId.add(Number(reviewLog.sid));
      } else if (reviewLog.source === reviewSources.note) {
        noteContentsId.add(Number(reviewLog.sid));
      }
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds([
      ...usersId,
    ]);
    const postsMap = await postFinderService.getPostsMapByIds([...postsId]);
    const threadsId = new Set();
    for (const post of postsMap.values()) {
      if (post.type === 'thread') {
        threadsId.add(post.tid);
      }
    }
    const threadsMap = await threadFinderService.getThreadsMapByIds([
      ...threadsId,
    ]);
    const firstPostsSet = new Set();
    for (const thread of threadsMap.values()) {
      firstPostsSet.add(thread.oc);
    }
    const firstPostsMap = await postFinderService.getPostsMapByIds([
      ...firstPostsSet,
    ]);
    const documentsMap = await documentFinderService.getDocumentsMapByIds([
      ...documentsId,
    ]);
    const notesMap = await noteContentFinderService.getNoteContentsMapByIds([
      ...noteContentsId,
    ]);
    const results = [];

    for (const reviewLog of reviewLogs) {
      let contentType = '';
      let contentUrl = '';
      let contentAbstract = '';

      switch (reviewLog.source) {
        case reviewSources.post: {
          const post = postsMap.get(reviewLog.sid);
          if (!post) {
            continue;
          }
          if (post.type === 'thread') {
            contentType = '论坛文章';
            const thread = threadsMap.get(post.tid);
            const firstPost = firstPostsMap.get(thread.oc);
            contentAbstract =
              `${firstPost.t} - ` +
              this.#extendContentAbstract(firstPost.l, firstPost.c);
          } else if (post.parentPostId === '') {
            contentType = '论坛回复';
            contentAbstract = this.#extendContentAbstract(post.l, post.c);
          } else {
            contentType = '论坛评论';
            contentAbstract = this.#extendContentAbstract(post.l, post.c);
          }
          contentUrl = getUrl('post', post.pid);
          break;
        }
        case reviewSources.document: {
          const document = documentsMap.get(Number(reviewLog.sid));
          if (!document) {
            continue;
          }
          switch (document.source) {
            case documentSources.article: {
              contentType = '专栏文章';
              break;
            }
            case documentSources.comment: {
              contentType = '专栏回复';
              break;
            }
            case documentSources.moment: {
              contentType = '电文/电文评论';
              break;
            }
          }
          contentAbstract =
            (document.title ? `${document.title} - ` : ``) +
            this.#extendContentAbstract(document.l, document.content);
          contentUrl = getUrl('documentNumber', document.did);
          break;
        }
        case reviewSources.note: {
          const noteContent = notesMap.get(Number(reviewLog.sid));
          if (!noteContent) {
            continue;
          }
          contentType = '笔记';
          contentAbstract = noteContent.content;
          contentUrl = getUrl('noteContent', noteContent.noteId);
          break;
        }
      }

      results.push({
        toc: reviewLog.toc,
        tlm: reviewLog.tlm,
        status: reviewLog.status,
        statusDesc: translateReview('zh_cn', `status_${reviewLog.status}`),
        user: usersObject[reviewLog.uid],
        handler: usersObject[reviewLog.handlerId] || null,
        triggerReason: this.#extendReason(
          reviewLog.triggerType,
          reviewLog.triggerReason,
        ),
        handlerReason: reviewLog.handlerReason,
        contentAbstract: contentAbstract,
        contentType: contentType,
        contentUrl: contentUrl,
      });
    }
    return {
      reviewLogs: results,
      paging,
    };
  };
}

module.exports = {
  reviewFinderService: new ReviewFinderService(),
};
