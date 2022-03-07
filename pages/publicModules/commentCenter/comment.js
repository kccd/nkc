import {getDataById} from "../../lib/js/dataConversion";
const data = getDataById('data');
import CommentEditor from "../../lib/vue/comment/CommentEditor";
const commentEditor = new Vue({
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


import CommentOptions from "../../comment/CommentOptions";
import DisabledComment from "../../lib/vue/DisabledComment";
import Complaint from "../../lib/vue/Complaint";
import ViolationRecord from "../../lib/vue/ViolationRecord";
import CommentPostEditor from "../../lib/vue/comment/CommentPostEditor";
const singleBottomDom = $('.single-post-bottom');
const singleCommentBottom = {};
for(let i = 0;i < singleBottomDom.length;i++) {
  const dom = singleBottomDom.eq(i);
  const cid = dom.attr('cid');
  singleCommentBottom[cid] = new Vue({
    el: `#singleCommentBottom_${cid}`,
    data: {
    },
    components: {
      "comment-options": CommentOptions,
      "disabled-comment": DisabledComment,
      complaint: Complaint,
      "violation-record": ViolationRecord,
      "comment-post-editor": CommentPostEditor
    },
    mounted() {
    },
    methods: {
      getDataById: getDataById,
      openOptions(e) {
        const target = $(e);
        const direction = e.getAttribute('data-direction') || 'up';
        const cid = e.getAttribute('data-cid');
        const data = this.getDataById(`comment_${cid}`);
        const init = e.getAttribute('data-init');
        if(init === 'true') return;
        this.$refs.commentOptions.open({DOM: target, comment: data.comment, direction});
        //阻止事件冒泡到父级
        event.stopPropagation();
      },
      //查看违规记录
      violationRecord(uid) {
        this.$refs.violationRecord.open({uid});
      },
      //退修或删除
      disableComment(cid) {
        this.$refs.disabledComment.open(function (res){
        }, {
          cid
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
      }
    }
  });
}

window.commentEditor = commentEditor;
window.singleCommentBottom = singleCommentBottom;
