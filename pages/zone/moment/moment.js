import Moment from '../../lib/vue/zone/Moment';
import MomentOption from "../../lib/vue/zone/momentOption/MomentOption";
import Complaint from "../../lib/vue/Complaint";
import ViolationRecord from "../../lib/vue/ViolationRecord";
import {getDataById} from "../../lib/js/dataConversion";
const data = getDataById('data');
const app = new Vue({
  el: "#app",
  components: {
    'moment': Moment,
    'moment-option': MomentOption,
    'complaint': Complaint,
    'violation-record': ViolationRecord
    
  },
  data: {
    focusCommentId: data.commentId,
    momentListData: data.momentListData
  },
  mounted() {
    this.showCommentPanel();
  },
  methods: {
    showCommentPanel() {
      this.$refs.moment.showCommentPanel();
    },
    openOption(data) {
      this.$refs.momentOption.open(data);
    },
    //投诉或举报
    complaint(mid) {
      this.$refs.complaint.open('moment', mid);
    },
    //查看违规记录
    violationRecord(uid) {
      this.$refs.violationRecord.open({uid});
    },
  }
});
