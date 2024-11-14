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
    moment-status(ref="momentStatus" :permissions="permissions")
    // 最新电文列表
    //.moment-latest-container(:key="latestMoment.momentId" v-for="latestMoment in latestData")
      moment(
          :data="latestMoment"
          @complaint="complaint"
          :permissions="permissions"
        )
    //.moment-divider(v-if="latestData.length>0") 以上是新内容
    .moment-container(:key="momentData.momentId" v-for="momentData in moments" v-if="!momentData.quoteData || !momentData.quoteData.data || !momentData.quoteData.data.status || momentData.quoteData.data.status!=='permission'")
      moment(
        @handleDetail='handleDetail'
        :data="momentData"
        @complaint="complaint"
        :permissions="permissions"
      )
</template>

<style lang="less" scoped>
  .moment-latest-container{
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
  }
  .moment-divider{
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
  .moment-container{
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
  }
</style>

<script>
  import Moment from './Moment.vue';
  import Complaint from "../Complaint";
  import ViolationRecord from "../ViolationRecord";
  // import MomentOption from "./momentOption/MomentOption";
  import MomentStatus from "./MomentStatus";
  import {EventBus} from "../../../spa/eventBus";``
  export default {
    props: ['moments', 'permissions','latests'],
    components: {
      // 'moment-option': MomentOption,
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
        if(!self.$refs.violationRecord){
              return;
        }
        self.$refs.violationRecord.open({uid});
      });
    },
    computed:{
      latestData(){
        if(!!this.latests){
          return [...this.latests];
        }else{
          return [];
        }
      }
    },
    methods: {
      // openOption(data) {
      //   this.$refs.momentOption.open(data);
      // },
      //投诉或举报
      complaint(mid) {
        this.$refs.complaint.open('moment', mid);
      },
      handleDetail(e){
        this.$emit('handleDetail',e)
      }
    }
  }
</script>
