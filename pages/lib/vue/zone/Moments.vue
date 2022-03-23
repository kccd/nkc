<template lang="pug">
  .moments
    //动态操作
    moment-option(
      ref="momentOption"
      @complaint="complaint"
      @violation-record="violationRecord"
    )
    complaint(ref="complaint")
    violation-record(ref="violationRecord")
    .moment-container(:key="momentData.momentId" v-for="momentData in moments")
      moment(
        :data="momentData"
        @open-option="openOption"
        @option-comment-option="openOption"
      )
</template>

<style lang="less" scoped>
  .moment-container{
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3rem;
    margin-bottom: 1.5rem;
  }
</style>

<script>
  import Moment from './Moment';
  import Complaint from "../Complaint";
  import ViolationRecord from "../ViolationRecord";
  import MomentOption from "./momentOption/MomentOption";
  import FloatUserPanel from "../FloatUserPanel";
  export default {
    props: ['moments'],
    components: {
      'moment-option': MomentOption,
      'moment': Moment,
      'complaint': Complaint,
      'violation-record': ViolationRecord,
      'float-user-panel': FloatUserPanel,
    },
    data: () => ({

    }),
    mounted() {
    },
    methods: {
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
  }
</script>
