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
const singleCommentBottom = new Vue({
  el: "#singleCommentBottom",
  data: {
  },
  components: {
    "comment-options": CommentOptions
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
      // e.stopPropagation();
    },
  }
});
window.commentEditor = commentEditor;
window.singleCommentBottom = singleCommentBottom;
