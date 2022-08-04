import Credit, {creditTypes, contentTypes} from '../lib/vue/Credit';
import MomentCommentChildEditor from '../lib/vue/zone/MomentCommentChildEditor'
const app = new Vue({
  el: '#app',
  components: {
    credit: Credit,
    'moment-comment-child-editor': MomentCommentChildEditor
  },
  mounted() {
    // this.$refs.credit.open(creditTypes.xsf, contentTypes.post, '904546');
  }
})
