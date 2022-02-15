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
    comment: Comment,
  },
  mounted() {
  },
  methods: {
  }
});

function typeConversion(type){
  console.log(type)
  const  map={
    article:'文章',
    url:'链接',
    text:'分组',
    post:'post',
  }
  return map[type]
}

window.typeConversion = typeConversion;