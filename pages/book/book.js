import Comment from "../comment/Comment";
import {getDataById} from "../lib/js/dataConversion";
const data = getDataById('data');
const app = new Vue({
  el: "#book",
  data: {
    source: 'book',
    sid: data.bookId
  },
  components: {
    comment: Comment
  }
});