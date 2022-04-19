<template lang="pug">
  .row
    paging.col-xs-12.col-md-12.m-l-1(ref="paging" :pages="pageButtons" @click-button="clickButton")
    .user-list-warning(v-if="(!users || users.length === 0) && !loading") 空空如也~
    //- user-info 数组中的一个用户对象
    .col-xs-12.col-md-6(v-for="user in users" v-else)
      user-info( :key="user.uid" :user="user" :page-type="t" :sub-uid="userSubUid")
</template>

<script>
let prevType = '';
import UserInfo from "./UserInfo";
import Paging from "../../Paging";

export default {
  components: {
    "user-info": UserInfo,
    "paging": Paging,
  },
  data: () => ({
    users: [],
    uid: '',
    paging: '',
    routeName: '',
    loading: false,
    userSubUid: '',
  }),
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  watch: {
    '$route.name': function(newVal, oldVal){
      if(newVal) {
        this.initData();
        this.getUserCardInfo();
      }
    }
  },
  mounted() {
    this.initData();
    this.getUserCardInfo();
  },
  methods: {
    initData() {
      const {params, name} = this.$route;
      this.routeName = name;
      this.t = name;
      const {uid} = params;
      this.uid = uid;
    },
    clickButton(num) {
      this.getUserCardInfo( num );
    },
    getUserCardInfo(page) {
      this.loading = true;
      let url = `/u/${this.uid}/profile/follower?t=${this.routeName}`;
      const self = this;
      if (page) {
        const index = url.indexOf("?");
        if (index === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `&page=${page}`;
        }
      }
      nkcAPI(url, "GET")
        .then(res => {
          self.paging = res.paging;
          self.users = res.users;
          self.userSubUid = res.userSubUid;
          self.loading = false;
        })
        .catch(err => {
          this.title = "数据加载失败！"
          sweetError(err);
        });
    }
  }
};
</script>

<style scoped lang="less">
  h3{
    text-align: center;
  }
  .user-list-warning {
    text-align: center;
    font-size: 1.2rem;
  }
</style>
