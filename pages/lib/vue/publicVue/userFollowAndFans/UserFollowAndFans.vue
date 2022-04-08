<template lang="pug">
  .row
    paging.col-xs-12.col-md-12(ref="paging" :pages="pageButtons" @click-button="clickButton")
    //- user-info 数组中的一个用户对象 
    .col.xs-12.col-md-12(v-if="!users || !users.length")
      h3 {{title}}
    .col-xs-12.col-md-6(v-for="user in users")
      user-info( :key="user.uid" :user="user" :page-type="type")
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
    type: "follow",
    users: [],
    paging: '',
    title: "数据加载中..."
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
  methods: {
    clickButton(num) {
      this.getUserCardInfo( num );
    },
    getUserCardInfo(page) {
      // 如果切换 粉丝和关注那么清空数据
      if(!prevType){
        prevType = this.type;
      }else{
        if(prevType !== this.type){
          this.users = [];
          prevType = this.type;
        }
      }
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
          if(!res.users || !res.users.length){
            this.title = "暂无数据！"
          }
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
</style>
