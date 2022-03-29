<template lang="pug">
  .user-attention
    paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
    .user-list-warning(v-if="!users || users.length === 0") 未关注任何用户
    .user-follow(v-else)
      user-attention(ref="user-attention" :users="users")
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
</style>
<script>
import UserAttention from "../userAttention/UserAttention";
import Paging from "../../Paging";
import {nkcAPI} from "../../../js/netAPI";

export default {
  data: () => ({
    uid: null,
    users: [],
    paging: null,
    routeName: null,
  }),
  components: {
    "user-attention": UserAttention,
    "paging": Paging
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  watch: {
    '$route.name': function (newVal, oldVal){
      if(newVal) this.initData();
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      const {name, params} = this.$route;
      this.routeName = name;
      const {uid} = params;
      this.uid = uid;
      this.getUserCardInfo(name, 0);
    },
    //获取用户卡片信息
    getUserCardInfo(type, page) {
      const {uid} = this;
      const self= this;
      let url = `/u/${uid}/userHomeCard`;
      if(type) {
        url = url + `?t=${type}`
      }
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
          //  关注的用户
          self.users = res.users;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //点击分页
    clickButton(num) {
      this.getUserCardInfo(this.routeName, num);
    }
  }
}
</script>
