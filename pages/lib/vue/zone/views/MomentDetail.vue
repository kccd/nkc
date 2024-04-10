<template lang="pug">
  .zone-moment-container
    //-.zone-back.m-b-05(title='返回' @click="backZoneList")
      span.fa.fa-mail-reply
    complaint(ref="complaint")
    violation-record(ref="violationRecord")
    moment-comment-child(ref='momentCommentChild')
    moment(
      ref='moment'
      @complaint="complaint"
      :data="momentListData"
      :focus='focusCommentId'
      :permissions="permissions"
      mode='complete'
      type="details"
      v-if="!loading"
      )
    .single-moment-container(v-else="loading") 
      .skeleton.m-b-1(style='min-height:4rem;')
      .skeleton.m-b-1(style='min-height:10rem;padding:1rem 0rem;')
        loading
      .skeleton(style='min-height:4rem;')
</template>

<style lang="less" scoped>
.zone-back{
  position: sticky;
  top: 6rem;
  font-size: 1.3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.1s;
  color: #d3dce6;
  border:1px transparent solid;
  z-index: 999;
  &:hover{
    color: #409eff;
    background-color: rgba(236, 245, 255, 0.6);
    border-radius: 4px;
    border:1px #b3d8ff solid;
    backdrop-filter: blur(10px);
    // background-color: rgba(255, 255, 255, 0.3);
  }
}
.skeleton{
      background-image: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
      width: 100%;
      height: 0.6rem;
      list-style: none;
      background-size: 400% 100%;
      background-position: 100% 50%;
      animation: skeleton-loading 1s ease infinite;
    }
    @keyframes skeleton-loading {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0 50%;
      }
    }
</style>

<script>
import { EventBus } from '../../../../spa/eventBus';
import { nkcAPI } from '../../../js/netAPI';
import { RNSetSharePanelStatus } from '../../../js/reactNative';
import ComplaintVue from '../../Complaint.vue';
import Loading from '../../Loading.vue';
import ViolationRecordVue from '../../ViolationRecord.vue';
import Moment from '../Moment.vue';
import MomentCommentChildVue from '../MomentCommentChild.vue';

// import {momentVote} from "../../js/zone/vote";
export default {
  components: {
    moment: Moment,
    complaint: ComplaintVue,
    'violation-record': ViolationRecordVue,
    'moment-comment-child': MomentCommentChildVue,
    loading: Loading,
  },
  // props: ['data', 'focus', 'permissions', 'mode', 'type'],
  data: () => ({
    focusCommentId: '',
    momentListData: [],
    permissions: null,
    loading: true,
  }),
  mounted() {
    this.initData();
  },
  computed: {},
  destroyed() {},
  methods: {
    initData() {
      const self = this;
      nkcAPI(`/z/m/${this.$route.params.mid}`, 'GET')
        .then((res) => {
          self.focusCommentId = res.focusCommentId;
          self.momentListData = res.momentListData;
          self.permissions = res.permissions;
          this.loading = false;
          this.$nextTick(() => {
            self.showCommentPanel();
          });
          //查看违规记录
          EventBus.$on('violation-record', function (uid) {
            if(!self.$refs.violationRecord){
              return;
            }
            self.$refs.violationRecord.open({ uid });
          });
          const momentData = JSON.parse(JSON.stringify(res.momentListData));
          if (NKC.configs.isApp) {
            RNSetSharePanelStatus(true, shareTypes.moment, momentData.momentId);
          }
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    showCommentPanel() {
      this.$refs.moment.showCommentPanel();
    },
    //投诉或举报
    complaint(mid) {
      this.$refs.complaint.open('moment', mid);
    },
    backZoneList(){
      this.$router.go(-1);
    }
  },
};
</script>
