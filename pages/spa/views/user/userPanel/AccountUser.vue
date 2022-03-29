<template lang="pug">
.user-account
  //- 用户左侧面板
  .col-sx-12.col-md-3.box-shadow-panel.p-r-0.p-l-0#get-left-user-info-list
    //- 用户链接
    user-link(ref="userLink" :target-user="targetUser" :nav-links="navLinks")
    //用户关注
    user-focus-on(ref="userFocusOn")
  //- 用户中间面板 先hi用户的动态， 文章，恢复等信息
  .col-xs-12.col-md-7.box-shadow-panel.p-r-0
    user-card(ref="userCard")
  //用户右侧面板
  .col-xs-12.col-md-2.box-shadow-panel.hidden-sm.hidden-xs

</template>
<style lang="less">
.user-account {

}
</style>
<script>
import {getColumnInfo} from "../../../../lib/js/tools";
import UserCard from "../../../../lib/vue/publicVue/userCard/UserCard";
import UserLink from "./UserLink";
import UserFocusOn from "./UserFocusOn";
export default {
  props: ['navLinks', 'target-user', 'type'],
  data: () => ({
    targetColumn: getColumnInfo(),
  }),
  components: {
    "user-card": UserCard,
    "user-link": UserLink,
    "user-focus-on": UserFocusOn
  },
  mounted() {
  },
  methods: {

  }
}

</script>
