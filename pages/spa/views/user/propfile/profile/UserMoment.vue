<template lang="pug">
  .user-moment.p-t-1
    .paging-button
      a.button(@click="toType('moment')" :class="t === 'moment'?'active':''") 动态
      a.button(@click="toType('thread')" :class="t === 'thread'?'active':''") 文章
    .user-list-warning(v-if="!momentsData && loading") 加载中~
    .moment-list(v-else)
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
      blank(v-if="momentsData && momentsData.length === 0 && !loading")
      moments(
        ref="moments"
        :moments="momentsData"
        @complaint="complaint"
        @violation-record="violationRecord"
        :permissions="permissions"
        v-else-if="momentsData && momentsData.length !== 0 && t === 'moment'"
      )
      article-list(
        ref="articleList"
        :articles="momentsData"
        v-else-if="momentsData && momentsData.length !== 0 && t === 'thread'"
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
import Blank from "../../../../components/Blank";
import ArticleList from "../../../../../lib/vue/article/ArticleList";
import {nkcAPI} from "../../../../../lib/js/netAPI";

export default {
  data: () => ({
    momentsData: null,
    paging: {},
    uid: null,
    loading: false,
    permissions: '',
    t: 'moment',
  }),
  components: {
    "moments": Moments,
    "complaint": Complaint,
    "violation-record": ViolationRecord,
    "paging": Paging,
    "blank": Blank,
    "article-list": ArticleList
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
    getUserCardInfo(page, type = 'moment') {
      const {uid} = this;
      const self= this;
      let url = `/u/${uid}/profile/momentData?t=${type}`;
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
    },
    //跳转到动态指定类型
    toType(type) {
      this.getUserCardInfo(0, type);
    }
  }
}
</script>
