import { getDataById } from '../../lib/js/dataConversion';
import { getSocket } from '../../lib/js/socket';
const socket = getSocket();
const data = getDataById('data');
import { initNKCSource } from '../../lib/js/nkcSource';
const { article } = data;
import { sweetError } from '../../lib/js/sweetAlert';
import CommentEditor from '../../lib/vue/comment/CommentEditor';
if (data.type === 'article' && window.$('#commentEditor').length !== 0) {
  window.commentEditor = new window.Vue({
    el: '#commentEditor',
    data: {
      comment: data.comment || null,
      articleId: data.article._id || '',
      columnInfo: data.columnInfo,
      addedToColumn: data.addedToColumn,
    },
    components: {
      'comment-editor': CommentEditor,
    },
    mounted() {
      this.initId();
    },
    methods: {
      initId() {},
      //引用评论
      quoteComment(docId) {
        this.$refs.commentEditor.changeQuote(docId, 'article');
      },
    },
  });
}

import CommentOptions from '../../comment/CommentOptions';
import DisabledComment from '../../lib/vue/DisabledComment';
import Complaint from '../../lib/vue/Complaint';
import ViolationRecord from '../../lib/vue/ViolationRecord';
import CommentPostEditor from '../../lib/vue/comment/CommentPostEditor';
import { nkcAPI } from '../../lib/js/netAPI';
import { screenTopAlert, screenTopWarning } from '../../lib/js/topAlert';
import CommentHit from '../../lib/vue/comment/CommentHit';
import { contentTypes, creditTypes } from '../../lib/vue/Credit';
const singleBottomDom = window.$('.single-post-bottom');
const singleCommentBottom = {};
for (let i = 0; i < singleBottomDom.length; i++) {
  const dom = singleBottomDom.eq(i);
  if (!dom) {
    continue;
  }
  const cid = dom.attr('cid');
  if (!cid) {
    continue;
  }
  initSingleCommentBottom(cid);
}

function initSingleCommentBottom(cid) {
  singleCommentBottom[cid] = new window.Vue({
    el: `#singleCommentBottom_${cid}`,
    data: {},
    components: {
      'comment-options': CommentOptions,
      'disabled-comment': DisabledComment,
      complaint: Complaint,
      'violation-record': ViolationRecord,
      'comment-post-editor': CommentPostEditor,
      'comment-hit': CommentHit,
    },
    mounted() {},
    methods: {
      getDataById: getDataById,
      //其他操作
      openOptions(e) {
        const target = window.$(e);
        const direction = e.getAttribute('data-direction') || 'up';
        const cid = e.getAttribute('data-cid');
        const data = this.getDataById(`comment_${cid}`);
        const init = e.getAttribute('data-init');
        if (init === 'true') {
          return;
        }
        this.$refs.commentOptions.open({
          DOM: target,
          comment: data.comment,
          direction,
        });
        //阻止事件冒泡到父级
        // event.stopPropagation();
      },
      //查看违规记录
      violationRecord(uid) {
        this.$refs.violationRecord.open({ uid });
      },
      //退修或删除
      disableComment(docId) {
        this.$refs.disabledComment.open(function (res) {}, {
          docId,
        });
      },
      //投诉或举报
      complaint(cid) {
        this.$refs.complaint.open('comment', cid);
      },
      //编辑评论
      editorComment(cid) {
        if (!cid) {
          return;
        }
        this.switchCommentEditor(cid);
      },
      //关闭评论编辑器
      closeCommentEditor(id) {
        this.switchPostBackground(id, 'false');
      },
      //评论编辑器开关
      switchCommentEditor(cid) {
        this.$refs.editorContainer.open(cid);
        this.switchPostBackground(cid, 'true');
      },
      //关闭评论编辑器
      closePostCommentEditor(cid) {
        this.closeCommentEditor(cid);
      },
      //评论背景开关
      switchPostBackground(cid, show) {
        const dom = window.$(`.single-post-container[data-cid="${cid}"]`);
        dom.attr('data-show-comments', show);
      },
      //通过审核
      passReview(docId) {
        this.$refs.commentOptions.passReview(docId);
      },
      //评论解封
      unblock(docId) {
        if (!docId) {
          return;
        }
        nkcAPI(`/comment/${docId}/unblock`, 'POST', {
          docsId: [docId],
        })
          .then(() => {
            screenTopAlert(docId + ' 已解除屏蔽');
          })
          .catch((err) => {
            sweetError(err);
          });
      },
    },
  });
}

function getPostsDom() {
  return $(".single-post-checkbox input[type='checkbox']");
}

//重置选中评论
function resetCheckbox() {
  getPostsDom().prop('checked', false);
}

//评论管理开关
function manageComments() {
  resetCheckbox();
  const comments = getPostsDom();
  if (comments.eq(0).css('display') === 'none') {
    comments.css('display', 'inline-block');
  } else {
    comments.css('display', 'none');
  }
}

//获取选中的评论id
function getMarkedCommentDocId() {
  const commentsDocId = [];
  const comments = getPostsDom();
  for (var i = 0; i < comments.length; i++) {
    const comment = comments.eq(i);
    if (comment.prop('checked')) {
      commentsDocId.push(comment.attr('data-docId'));
    }
  }
  return commentsDocId;
}

//全选
function markAllComments() {
  const comments = getPostsDom();
  if (comments.eq(0).css('display') !== 'inline-block') {
    return;
  }
  var length = comments.length;
  var count = 0;
  for (var i = 0; i < length; i++) {
    var p = comments.eq(i);
    if (p.prop('checked')) {
      count++;
    }
  }
  if (length === count) {
    comments.prop('checked', false);
  } else {
    comments.prop('checked', true);
  }
}

//退修或禁用
function disabledMarkedComment() {
  const commentsDocId = getMarkedCommentDocId();
  disabledArticleComment(commentsDocId);
}

function disabledArticleComment(commentsDocId) {
  NKC.methods.disabledDocuments(commentsDocId);
}

var nkchl = [];

// 回复发表成功后将后台返回的内容动态插入最后一页评论页
function insertRenderedComment(renderedComment) {
  if (!renderedComment) {
    return;
  }
  //排除自己的发表
  if (
    renderedComment.comment &&
    NKC.configs.uid !== renderedComment.comment.uid
  ) {
    const comment = {
      content: renderedComment.comment.content,
      contentUrl: renderedComment.comment.commentUrl,
      avatarUrl:
        renderedComment.comment.user && renderedComment.comment.user.avatarUrl,
      postId: renderedComment.comment.did,
      uid: renderedComment.comment.uid,
      username:
        renderedComment.comment.user && renderedComment.comment.user.username,
    };
    bulletComments.add(comment);
  }
  //仅在最后一页时才动态插入内容
  if (!data.isLastPage) {
    return;
  }
  var JQDOM = $(renderedComment.html).find('.single-post-container');
  JQDOM = JQDOM[0];
  // 公式渲染
  /*try {
    MathJax.typesetPromise([JQDOM]);
  } catch (err) {
    console.log(err);
  }*/
  JQDOM = $(JQDOM);
  var parentDom = $('.comment-list');
  parentDom.append(JQDOM);
  $('#nullComments').remove();
  // 视频音频组件渲染
  // NKC.methods.initVideo();
  // 操作
  initSingleCommentBottom(renderedComment.commentId);
  // 外链复原
  // NKC.methods.replaceNKCUrl();
  // 划词笔记
  // const elements = document.querySelectorAll(`[data-type="nkc-render-content"][data-id="${renderedComment.articleId}"]`);
  // for(let i = 0; i < elements.length; i++) {
  //   const element = elements[i];
  //   nkchl.push(new NKC.modules.NKCHL({
  //     type: 'comment',
  //     targetId: renderedComment.commentId,
  //     notes: [],
  //     rootElement: element
  //   }));
  // }
  initNKCSource();
}

$(function () {
  if (NKC.configs.uid && socket) {
    window.bulletComments = new NKC.modules.BulletComments({
      offsetTop: NKC.configs.isApp ? 20 : 60,
    });
    if (socket.connected) {
      joinCommentRoom();
    } else {
      socket.on('connect', function () {
        joinCommentRoom();
      });
    }
    socket.on('articleCommentMessage', function (data) {
      insertRenderedComment(data);
    });
  }
});

function joinCommentRoom() {
  socket.emit('joinRoom', {
    type: 'article',
    data: {
      articleId: article._id,
    },
  });
}

//屏蔽鼓励原因
function hideCommentKcbRecord(cid, recordId, hide) {
  nkcAPI('/comment/' + cid + '/credit/kcb/' + recordId, 'PUT', {
    hide: !!hide,
  })
    .then(function () {
      if (hide) {
        screenTopAlert('屏蔽成功');
      } else {
        screenTopAlert('已取消屏蔽');
      }
    })
    .catch(function (data) {
      screenTopWarning(data);
    });
}

//撤销学术分
function cancelCommentXsf(cid, id) {
  var reason = prompt('请输入撤销原因：');
  if (reason === null) {
    return;
  }
  if (reason === '') {
    return screenTopWarning('撤销原因不能为空！');
  }
  nkcAPI(
    '/comment/' + cid + '/credit/xsf/' + id + '?reason=' + reason,
    'DELETE',
    {},
  )
    .then(function () {
      window.location.reload();
    })
    .catch(function (data) {
      screenTopWarning(data.error || data);
    });
}

//鼓励回复
function creditKcbPanel(cid) {
  window.RootApp.openCredit(creditTypes.kcb, contentTypes.comment, cid);
}

window.singleCommentBottom = singleCommentBottom;

Object.assign(window, {
  getPostsDom,
  resetCheckbox,
  insertRenderedComment,
  creditKcbPanel,
  hideCommentKcbRecord,
  cancelCommentXsf,
  initSingleCommentBottom,
  joinCommentRoom,
  manageComments,
  getMarkedCommentDocId,
  markAllComments,
  disabledArticleComment,
  disabledMarkedComment,
});
