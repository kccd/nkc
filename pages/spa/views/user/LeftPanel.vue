<template lang="pug">
  .left-panel
    //- 用户链接
    .m-b-1
      user-link(ref="userLink" :target-user="targetUser" :nav-links="navLinks")
    //用户关注
    .m-b-1
      user-focus-on(ref="userFocusOn")
</template>
<style lang="less">
@import "../../../publicModules/base";

</style>
<script>
import UserFocusOn from "./userPanel/UserFocusOn";
import UserLink from "./userPanel/UserLink";
export default {
  props: ['nav-links', 'target-user'],
  data: () => ({

  }),
  components: {
    "user-focus-on": UserFocusOn,
    "user-link": UserLink,
  },
  methods: {

  }
}
</script>
