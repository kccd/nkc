<template lang="pug">
  .creation-collections.col-xs-12.col-md-9.m-b-1
    collections(ref="collections")
</template>
<style lang="less" scoped>
.creation-collections {

}
</style>
<script>
import SubscribeCollection from "../../user/subscribe/SubscribeCollection";
export default {
  data: () => ({
  }),
  components: {
    "collections": SubscribeCollection
  },
}
</script>
