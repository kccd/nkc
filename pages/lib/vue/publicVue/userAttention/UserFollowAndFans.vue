<template lang="pug">
<<<<<<< HEAD:pages/lib/vue/publicVue/userAttention/UserFollowAndFans.vue
  .row
    //- user-info 数组中的一个用户对象 
=======
  .user-attention
    //- user-info 数组中的一个用户对象
>>>>>>> 8b498f28c89a9575574a8e5d45ba90b92e31e4d1:pages/lib/vue/publicVue/userAttention/UserAttention.vue
    .col-xs-12.col-md-6(v-for="user in usersInfo")
      user-info( :key="user.uid" :user="user || {}" )
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
    'users': {
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
