<template lang="pug">
  .row
    paging.col-xs-12.col-md-12(ref="paging" :pages="pageButtons" @click-button="clickButton")
    //- user-info 数组中的一个用户对象
    .col-xs-12.col-md-6(v-for="user in users")
      user-info( :key="user.uid" :user="user" :page-type="type")
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
    type: "follow",
    users: [],
    uid: '',
    paging: '',
    routeName: '',
  }),
  props: ["pageType"],
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  watch: {
    pageType: {
      immediate: true,
      handler(n) {
        if (typeof n === "undefined") {
          console.error("pageType is undefined");
          return;
        }

        this.type = n;
        this.getUserCardInfo();
      }
    }
  },
  created() {

  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      const {params, name} = this.$route;
      this.routeName = name;
      const {uid} = params;
      this.uid = uid;
    },
    clickButton(num) {
      this.getUserCardInfo( num );
    },
    getUserCardInfo(page) {
      let url = `/u/${this.uid}/p/${this.routeName}`;
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
          self.t = res.t;
          self.paging = res.paging;
          self.users = res.users;
        })
        .catch(err => {
          sweetError(err);
        });
    }
  }
};
</script>

<style scoped lang="less"></style>
