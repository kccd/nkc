<template lang="pug">
.container-fluid.max-width
  mixin buttonGroup
    .bubble-back(v-if="showBack" @click="backZoneList")
      .back-box.user-select-none
        span.icon.fa.fa-angle-left
        span.text(v-if="fromZone") 返回上级
        span.text(v-else) 回到电波
  .row
    .col-md-offset-2.col-xs-12.col-md-8.min-md-p-r-0
      .m-b-05
        +buttonGroup
      .box-shadow
        .zone-moment-container
          complaint(ref="complaint")
          violation-record(ref="violationRecord")
          //- moment-comment-child(ref='momentCommentChild')
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
      .m-t-05
        +buttonGroup
</template>

<style lang="less" scoped>
// .zone-back{
//   position: sticky;
//   top: 6rem;
//   font-size: 1.3rem;
//   text-align: center;
//   cursor: pointer;
//   transition: all 0.1s;
//   color: #d3dce6;
//   border:1px transparent solid;
//   z-index: 999;
//   &:hover{
//     color: #409eff;
//     background-color: rgba(236, 245, 255, 0.6);
//     border-radius: 4px;
//     border:1px #b3d8ff solid;
//     backdrop-filter: blur(10px);
//     // background-color: rgba(255, 255, 255, 0.3);
//   }
// }
.zone-moment-container{
  padding: 1rem;
  @media screen and (max-width: 768px) {
    padding: 0;  
  }
}
.bubble-back {
  cursor: pointer;
  padding: 0 0.7rem;
  height: 2.8rem;
  width: 8rem;
  background-color: white;
  border-radius: 2.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.5);
  transition: all 0.1s;

  &:hover {
    border: 1px solid #ccc;
    color: rgba(0, 0, 0, 0.7);
  }

  .back-box {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    span {
      text-align: center;
      display: inline-block;
      vertical-align: middle;
    }
  }

  .icon {
    font-size: 1.8rem;
    font-weight: bold;
  }

  .text {
    margin-left: 1rem;
    font-size: 14px;
  }
}

.skeleton {
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
import { getDataById } from '../../../js/dataConversion';
import { nkcAPI } from '../../../js/netAPI';
import { visitUrl } from '../../../js/pageSwitch';
import { RNSetSharePanelStatus } from '../../../js/reactNative';
import { shareTypes } from '../../../js/shareTypes';
import { getState } from '../../../js/state';
import ComplaintVue from '../../Complaint.vue';
import Loading from '../../Loading.vue';
import ViolationRecordVue from '../../ViolationRecord.vue';
import Moment from '../Moment.vue';
// import MomentCommentChildVue from '../MomentCommentChild.vue';

// import {momentVote} from "../../js/zone/vote";
export default {
  components: {
    moment: Moment,
    complaint: ComplaintVue,
    'violation-record': ViolationRecordVue,
    // 'moment-comment-child': MomentCommentChildVue,
    loading: Loading,
  },
  // props: ['data', 'focus', 'permissions', 'mode', 'type'],
  data: () => ({
    focusCommentId: '',
    momentListData: [],
    permissions: null,
    loading: true,
    fromZone: false,
    showBack: true,
  }),
  created() {
    const { currentPage } = this.$store.state;
    if (currentPage === 'Zone') {
      this.fromZone = true;
    }
    const { isApp } = getState();
    if (isApp) {
      this.showBack = false;
    }
  },
  mounted() {
    this.initData();
  },
  computed: {},
  destroyed() { },
  methods: {
    initData() {
      const self = this;
      nkcAPI(`/api/v1/zone/m/${this.$route.params.mid}`, 'GET')
        .then((data) => {
          const res = data.data;
          self.focusCommentId = res.focusCommentId;
          self.momentListData = res.momentListData;
          self.permissions = res.permissions;
          self.loading = false;
          self.$nextTick(() => {
            self.showCommentPanel();
          });
          //查看违规记录
          EventBus.$on('violation-record', function (uid) {
            if (!self.$refs.violationRecord) {
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
      const queries = new URLSearchParams(window.location.search);
      if (['comment', 'repost'].includes(queries.get('type'))) {
        // const element = document.querySelector('.single-moment-detail-options');
        //   if (element) {
        //     element.scrollIntoView({ behavior: 'instant', block: 'start' });
        //   }
        // this.$store.commit('setDetailPageScroll', true)
        setTimeout(() => {
          const textarea = this.findComponentByRef('textarea', this.$refs.moment.$children);
          if (textarea) {
            textarea.focus();
          }
        }, 150);
      }
      const type = queries.get('type') || 'comment';
      if (['comment', 'repost'].includes(type)) {
        this.$refs.moment.showTypePanel(type);
      }
      // this.$refs.moment.showCommentPanel();
    },
    //投诉或举报
    complaint(mid) {
      this.$refs.complaint.open('moment', mid);
    },
    backZoneList() {
      if (this.fromZone) {
        this.$router.go(-1);
      } else {
        visitUrl(
          `/z?t=m-${localStorage.getItem('zoneTab') || 'a'
          }`,
        );
      }

    },
    findComponentByRef(refName, components) {
      const tempObject = {};
      const getRef = (name, coms) => {
        for (let i = 0; i < coms.length; i++) {
          const com = coms[i];
          if (com.$refs && com.$refs[name]) {
            tempObject[name] = com;
            return;
          }
          if (com.$children.length > 0) {
            getRef(name, com.$children);
          }
        }
      }
      getRef(refName, components);
      return tempObject[refName];
    }
  },
};
</script>
