<template lang="pug">
  .row
    //- user-info 数组中的一个用户对象 
    .col-xs-12.col-md-6(v-for="user in users")
      user-info( :key="user.uid" :user="user || {}" :page-type="type")
</template>

<script>
import UserInfo from "./UserInfo";
export default {
  components: {
    "user-info": UserInfo,
    type: "follow"
  },
  data: () => ({
    users: []
  }),
  props: ["pageType"],
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
  methods: {
    getUserCardInfo(page) {
      const uid = this.$route.params.uid;
      // let url = `/u/${uid}/userHomeCard?t=${this.type}`;
      let url = `/u/${uid}/content/${this.type}`;
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
          this.t = res.t;
          this.paging = res.paging;
          this.users = res.users;
        })
        .catch(err => {
          sweetError(err);
        });
    }
  }
};
</script>

<style scoped lang="less"></style>
