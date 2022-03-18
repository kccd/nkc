import Moment from '../../lib/vue/zone/Moment';
import {getDataById} from "../../lib/js/dataConversion";
const data = getDataById('data');
const app = new Vue({
  el: "#app",
  components: {
    'moment': Moment,
  },
  data: {
    momentListData: data.momentListData
  },
  mounted() {
    this.showCommentPanel();
  },
  methods: {
    showCommentPanel() {
      this.$refs.moment.showCommentPanel();
    }
  }
});