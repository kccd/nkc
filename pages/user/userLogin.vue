<template lang="pug">
    .user-drawer-header
      .user-drawer-visitor
        .col-xs-12
          .fa.fa-user-circle
        .col-xs-4.col-xs-offset-2
          a(onclick="toLogin()") 登录
        .col-xs-4
          a(onlick="toLogin('register')") 注册
</template>

<script>
import {toLogin} from "../lib/js/account";

export default {
  data: () => ({
  }),
  components: {
  },
  mounted() {
  },
  methods: {
    toLogin,
  }
}
</script>

<style lang="less" scoped>
.user-drawer-visitor{
  overflow: hidden;
  text-align: center;
  padding-bottom: 1rem;
}
.user-drawer-visitor .fa{
  display: inline-block;
  height: 4.5rem;
  color: #dedede;
  width: 4.5rem;
  font-size: 4rem;
  line-height: 4.5rem;
}
.user-drawer-visitor .col-xs-4{
  margin-top: 1rem;
}
.user-drawer-visitor a{
  color: #9baec8;
}
.user-drawer-visitor a:hover, .user-drawer-visitor a:link, .user-drawer-visitor a:active, .user-drawer-visitor a:visited{
  text-decoration: none;
  color: #9baec8;
}
</style>
