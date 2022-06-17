<template lang="pug">
  div.col-xs-12.col-md-9.m-b-1
    black-list(ref="blackList")
</template>
<style lang="less" scoped>

</style>
<script>
import SubscribeBlacklist from "../../user/subscribe/SubscribeBlacklist";
export default {
  data: () => ({

  }),
  components: {
    'black-list': SubscribeBlacklist
  }

}
</script>
