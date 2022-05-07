<template lang="pug">
  .user-moment
    paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
    .user-list-warning(v-if="!momentsData && loading") 加载中~
    .moment-list(v-else)
      blank(v-if="momentsData && momentsData.length === 0 && !loading")
      moments(
        ref="moments"
        :moments="momentsData"
        @complaint="complaint"
        @violation-record="violationRecord"
        :permissions="permissions"
        v-else
      )
      complaint(ref="complaint")
      violation-record(ref="violationRecord")
    paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
</template>
<style lang="less" scoped>
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
import Blank from "../../../../components/Blank";

export default {
  data: () => ({
    momentsData: null,
    paging: {},
    uid: null,
    loading: false,
    permissions: '',
  }),
  components: {
    "moments": Moments,
    "complaint": Complaint,
    "violation-record": ViolationRecord,
    "paging": Paging,
    "blank": Blank
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
      const {uid} = this;
      const self= this;
      let url = `/u/${uid}/profile/momentData`;
      if(page) {
        const index = url .indexOf('?');
        if(index === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `&page=${page}`;
        }
      }
      self.loading = true;
      nkcAPI(url, "GET")
        .then(res => {
          self.t = res.t;
          self.paging = res.paging;
          self.momentsData = res.momentsData;
          self.permissions = res.permissions;
        })
        .catch(err => {
          sweetError(err);
        })
      self.loading = false;
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
