<template lang="pug">
  .row.p-t-1
    .col-xs-12
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
    .col-xs-12(v-if="(!users || users.length === 0) && !loading")
      .user-list-warning 空空如也~
    //- user-info 数组中的一个用户对象
    .col-xs-12.col-md-6(v-for="user in users" v-else)
      .row
        user-info( :key="user.uid" :user="user" :page-type="t" :sub-uid="userSubUid" @delete="deleteSubUid" @add="addSubUid")
</template>

<script>
import {setPageTitle} from "../../../js/pageSwitch";

let prevType = '';
import UserInfo from "./UserInfo";
import Paging from "../../Paging";
import {getState} from "../../../js/state";
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
    userSubUid: [],
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
    setPageTitle(this.routeName === 'fan'?'粉丝':'关注');
  },
  methods: {
    initData() {
      const {path, params} = this.$route;
      const {uid: stateUid} = getState();
      const index = path.indexOf('follower');
      let name;
      if(index === -1) {
        name = 'fan';
      } else {
        name = 'follower';
      }
      this.routeName = name;
      this.t = name;
      const {uid} = params;
      this.uid = uid || stateUid;
    },
    clickButton(num) {
      this.getUserCardInfo( num );
    },
    deleteSubUid(uid) {
      const index = this.userSubUid.indexOf(uid);
      this.userSubUid.splice(index, 1);
    },
    addSubUid(uid) {
      this.userSubUid.push(uid);
    },
    getUserCardInfo(page) {
      this.loading = true;
      let url = `/u/${this.uid}/profile/followerData?t=${this.routeName}`;
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
