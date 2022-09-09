import Moment from '../../lib/vue/zone/Moment';
import MomentCommentChild from '../../lib/vue/zone/MomentCommentChild';
import MomentOption from "../../lib/vue/zone/momentOption/MomentOption";
import Complaint from "../../lib/vue/Complaint";
import ViolationRecord from "../../lib/vue/ViolationRecord";
import {getDataById} from "../../lib/js/dataConversion";
import {EventBus} from "../../spa/eventBus";
const data = getDataById('data');
const app = new Vue({
  el: "#app",
  components: {
    'moment': Moment,
    'moment-option': MomentOption,
    'complaint': Complaint,
    'violation-record': ViolationRecord,
    'moment-comment-child': MomentCommentChild,
  },
  data: {
    focusCommentId: data.focusCommentId,
    momentListData: data.momentListData,
    permissions: data.permissions,

  },
  mounted() {
    const self = this;
    self.showCommentPanel();
    //查看违规记录
    EventBus.$on('violation-record', function (uid) {
      self.$refs.violationRecord.open({uid});
    });
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
    showCommentChild() {
      const {parentCommentId, focusCommentId} = this;
      this.$refs.momentCommentChild.open({
        commentId: parentCommentId,
        focusCommentId
      });
    }
  }
});

