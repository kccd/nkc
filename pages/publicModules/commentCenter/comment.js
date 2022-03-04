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
    }
  }
})
window.CommentPostEditor = CommentPostEditor;
