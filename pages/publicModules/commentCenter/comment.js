import {getDataById} from "../../lib/js/dataConversion";
const data = getDataById('data');
import CommentEditor from "../../lib/vue/comment/CommentEditor";
if(data.type === 'article' && $("#commentEditor").length !== 0) {
  window.commentEditor = new Vue({
    el: "#commentEditor",
    data: {
      comment: data.comment || null,
      articleId: data.article._id || '',
    },
    components: {
      "comment-editor": CommentEditor
    },
    mounted() {
      this.initId();
    },
    methods: {
      initId() {
      },
      //引用评论
      quoteComment(docId) {
        this.$refs.commentEditor.changeQuote(docId, 'article');
      }
    }
  })
}


import CommentOptions from "../../comment/CommentOptions";
import DisabledComment from "../../lib/vue/DisabledComment";
import Complaint from "../../lib/vue/Complaint";
import ViolationRecord from "../../lib/vue/ViolationRecord";
import CommentPostEditor from "../../lib/vue/comment/CommentPostEditor";
import {nkcAPI} from "../../lib/js/netAPI";
import {screenTopAlert} from "../../lib/js/topAlert";
import CommentHit from "../../lib/vue/comment/CommentHit";
const singleBottomDom = $('.single-post-bottom');
const singleCommentBottom = {};
for(let i = 0;i < singleBottomDom.length;i++) {
  const dom = singleBottomDom.eq(i);
  if(!dom) continue;
  const cid = dom.attr('cid');
  if(!cid) continue;
  singleCommentBottom[cid] = new Vue({
    el: `#singleCommentBottom_${cid}`,
    data: {
    },
    components: {
      "comment-options": CommentOptions,
      "disabled-comment": DisabledComment,
      complaint: Complaint,
      "violation-record": ViolationRecord,
      "comment-post-editor": CommentPostEditor,
      "comment-hit": CommentHit

    },
    mounted() {
    },
    methods: {
      getDataById: getDataById,
      //其他操作
      openOptions(e) {
        const target = $(e);
        const direction = e.getAttribute('data-direction') || 'up';
        const cid = e.getAttribute('data-cid');
        const data = this.getDataById(`comment_${cid}`);
        const init = e.getAttribute('data-init');
        if(init === 'true') return;
        this.$refs.commentOptions.open({DOM: target, comment: data.comment, direction});
        //阻止事件冒泡到父级
        // event.stopPropagation();
      },
      //查看违规记录
      violationRecord(uid) {
        this.$refs.violationRecord.open({uid});
      },
      //退修或删除
      disableComment(docId) {
        this.$refs.disabledComment.open(function (res){
        }, {
          docId
        })
      },
      //投诉或举报
      complaint(cid) {
        this.$refs.complaint.open('comment', cid);
      },
      //编辑评论
      editorComment(cid) {
        if(!cid) return;
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
        const dom = $(`.single-post-container[data-cid="${cid}"]`);
        dom.attr('data-show-comments', show);
      },
      //通过审核
      passReview(docId) {
        this.$refs.commentOptions.passReview(docId);
      },
      //评论解封
      unblock(docId) {
        if(!docId) return;
        nkcAPI(`/comment/${docId}/unblock`, 'POST', {
          docsId: [docId]
        })
          .then(res => {
            screenTopAlert(docId +' 已解除屏蔽')
          })
          .catch(err => {
            sweetError(err);
          })
      }

    }
  });
}

function getPostsDom() {
  return $(".single-post-checkbox input[type='checkbox']");
}

//重置选中评论
function resetCheckbox() {
  getPostsDom().prop("checked", false);
}

//评论管理开关
function manageComments() {
  resetCheckbox();
  const comments = getPostsDom();
  if(comments.eq(0).css("display") === "none") {
    comments.css("display", "inline-block")
  } else {
    comments.css("display", "none");
  }
}

//获取选中的评论id
function getMarkedCommentDocId() {
  const commentsDocId = [];
  const comments = getPostsDom();
  for(var i = 0;i < comments.length;i ++) {
    const comment = comments.eq(i);
    if(comment.prop("checked")) {
      commentsDocId.push(comment.attr("data-docId"));
    }
  }
  return commentsDocId;
}

//全选
function markAllComments() {
  const comments = getPostsDom();
  if(comments.eq(0).css("display") !== "inline-block") return;
  var length = comments.length;
  var count = 0;
  for(var i = 0; i < length; i++) {
    var p = comments.eq(i);
    if(p.prop("checked")) count ++;
  }
  if(length === count) {
    comments.prop("checked", false);
  } else {
    comments.prop("checked", true);
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

window.singleCommentBottom = singleCommentBottom;

Object.assign(window, {
  getPostsDom,
  resetCheckbox,
  manageComments,
  getMarkedCommentDocId,
  markAllComments,
  disabledArticleComment,
  disabledMarkedComment,
});
