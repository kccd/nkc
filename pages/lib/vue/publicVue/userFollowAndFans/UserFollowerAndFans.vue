<template lang="pug">
  .row(v-if="loading")
    paging.col-xs-12.col-md-12(ref="paging" :pages="pageButtons" @click-button="clickButton")
    //- user-info 数组中的一个用户对象
    .col-xs-12.col-md-6(v-for="user in users")
      user-info( :key="user.uid" :user="user" :page-type="t")
</template>

<script>
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
      this.loading = false;
      let url = `/u/${this.uid}/p/follower?t=${this.routeName}`;
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
          self.loading = true;
        })
        .catch(err => {
          sweetError(err);
        });
    }
  }
};
</script>

<style scoped lang="less"></style>
