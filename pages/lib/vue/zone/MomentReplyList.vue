<template lang="pug">
  .moments
    complaint(ref="complaint")
    violation-record(ref="violationRecord")
    moment-status(ref="momentStatus" :permissions="permissions")
    .moment-container(:key="momentData.momentId" v-for="momentData in moments" v-if="!momentData.parentData || !momentData.parentData.data || !momentData.parentData.data.status || momentData.parentData.data.status!=='permission'")
      moment(
        @handleDetail='handleDetail'
        :data="momentData"
        @complaint="complaint"
        :permissions="permissions"
      )
      
</template>

<style lang="less" scoped>
.moment-latest-container {
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.moment-divider {
  height: 2rem;
  line-height: 2rem;
  background-color: #3085d624;
  border-radius: 2px;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.15rem;
  text-align: center;
  color: #666;
}

.moment-container {
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}
</style>

<script>
import Moment from './MomentReply.vue';
import Complaint from "../Complaint";
import ViolationRecord from "../ViolationRecord";
import MomentStatus from "./MomentStatus";
import { EventBus } from "../../../spa/eventBus";
import { getState } from '../../js/state';
const state = getState();
export default {
  props: ['moments', 'permissions'],
  components: {
    'moment': Moment,
    'complaint': Complaint,
    'violation-record': ViolationRecord,
    'moment-status': MomentStatus
  },
  data: () => ({
    expandContent: false,
    isFold: false, //是否折叠
  }),
  mounted() {
    const self = this;
    EventBus.$on('violation-record', function (uid) {
      if (!self.$refs.violationRecord) {
        return;
      }
      self.$refs.violationRecord.open({ uid });
    });
  },
  computed: {
  },
  methods: {
    //投诉或举报
    complaint(mid) {
      this.$refs.complaint.open('moment', mid);
    },
    handleDetail(e) {
      this.$emit('handleDetail', e)
    },
    handleMid(mid) {
      // this.submitting = false;
      // this.selectedMomentId = mid;
    },
    openContent(momentData) {
      if (momentData.mode === 'rich') {
        this.visitUrl(momentData.url, true);
      } else {
        this.expandContent = true;
      }
    },
    closeContent() {
      this.expandContent = false;
    },
    handleClick(url, e) {
      if (e) {
        // 处理未阻止捕获的事件
        if (e.target.tagName === 'A') {
          e.preventDefault();
          this.visitUrl(e.target.href, true);
          return;
        }
      }
      // 检查是否为选中文本
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        // 用户选中了文本，不执行后续操作
        return;
      }
      this.visitUrl(`${url}`, true);

    },
    clickDetail(url, e) {
      e.preventDefault();
      if (state.isApp) {
        this.visitUrl(url, true);
      } else {
        this.$router.push(url);
      }
    },
  }
}
</script>
