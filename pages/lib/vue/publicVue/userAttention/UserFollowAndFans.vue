<template lang="pug">
  .row
    //- user-info 数组中的一个用户对象 
    .col-xs-12.col-md-6(v-for="user in usersInfo")
      user-info( :key="user.uid" :user="user" )
</template>

<script>
import UserInfo from "./UserInfo";
export default {
  components: {
    "user-info": UserInfo
  },
  data: () => ({
    usersInfo: []
  }),
  props: {
    users: {
      type: Array,
      required: true
    }
  },
  watch: {
    users: {
      immediate: true,
      handler(n) {
        if (typeof n === "undefined") {
          console.error("users is undefined");
          return;
        }
        this.usersInfo = n;
      }
    }
  }
};
</script>

<style scoped lang="less"></style>
