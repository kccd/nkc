<template lang="pug">
  .moments
    //动态操作
    //moment-option(
    //  ref="momentOption"
    //  @complaint="complaint"
    //  @violation-record="violationRecord"
    //)
    complaint(ref="complaint")
    violation-record(ref="violationRecord")
    moment-status(ref="momentStatus")
    .moment-container(:key="momentData.momentId" v-for="momentData in moments")
      moment(
        :data="momentData"
        @complaint="complaint"
      )
</template>

<style lang="less" scoped>
  .moment-container{
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
  }
</style>

<script>
  import Moment from './Moment';
  import Complaint from "../Complaint";
  import ViolationRecord from "../ViolationRecord";
  import MomentOption from "./momentOption/MomentOption";
  import MomentStatus from "./MomentStatus";
  import {EventBus} from "../../../spa/eventBus";
  export default {
    props: ['moments'],
    components: {
      'moment-option': MomentOption,
      'moment': Moment,
      'complaint': Complaint,
      'violation-record': ViolationRecord,
      'moment-status': MomentStatus
    },
    data: () => ({

    }),
    mounted() {
      const self = this;
      EventBus.$on('violation-record', function(uid) {
        self.$refs.violationRecord.open({uid});
      });
    },
    methods: {
      // openOption(data) {
      //   this.$refs.momentOption.open(data);
      // },
      //投诉或举报
      complaint(mid) {
        this.$refs.complaint.open('moment', mid);
      },
    }
  }
</script>
