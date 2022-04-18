<template lang="pug">
  .user-moment
    paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
    .user-list-warning(v-if="(!momentsData || momentsData.length === 0) && !loading") 空空如也~
    .moment-list(v-else)
      moments(
        ref="moments"
        :moments="momentsData"
        @complaint="complaint"
        @violation-record="violationRecord"
      )
      complaint(ref="complaint")
      violation-record(ref="violationRecord")
</template>
<style lang="less">
@import "../../../../../publicModules/base";
.user-moment {
  .user-list-warning {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 5rem;
    margin-bottom: 5rem;
  }
}
</style>
<script>
import Moments from "../../../../../lib/vue/zone/Moments";
import Complaint from "../../../../../lib/vue/Complaint";
import ViolationRecord from "../../../../../lib/vue/ViolationRecord";
import Paging from "../../../../../lib/vue/Paging";
import {nkcAPI} from "../../../../../lib/js/netAPI";

export default {
  data: () => ({
    momentsData: [],
    paging: {},
    uid: null,
    loading: false,
  }),
  components: {
    "moments": Moments,
    "complaint": Complaint,
    "violation-record": ViolationRecord,
    "paging": Paging,

  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    const {name, params} = this.$route;
    const {uid} = params;
    this.uid = uid;
    this.getUserCardInfo(0);
  },
  methods: {
    //获取用户卡片信息
    getUserCardInfo(page) {
      this.loading = true;
      const {uid} = this;
      const self= this;
      let url = `/u/${uid}/p/moment`;
      if(page) {
        const index = url .indexOf('?');
        if(index === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `&page=${page}`;
        }
      }
      nkcAPI(url, "GET")
        .then(res => {
          self.t = res.t;
          self.paging = res.paging;
          self.momentsData = res.momentsData;
        })
        .catch(err => {
          sweetError(err);
        })
      this.loading = false;
    },
    //投诉或举报
    complaint(mid) {
      this.$refs.complaint.open('moment', mid);
    },
    //查看违规记录
    violationRecord(uid) {
      this.$refs.violationRecord.open({uid});
    },
    //点击分页
    clickButton(num) {
      this.getUserCardInfo(num);
    }
  }
}
</script>
