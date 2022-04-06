<template lang="pug">
  .hidden-sm.hidden-xs(v-if="forums" )
    sub-forum(:forums="forums")
    subscribes
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
</style>
<script>
import SubForum from "./userPanel/SubForum";
import Subscribes from "./userPanel/Subscribes";
export default {
  props: ['forums', 'target-user'],
  data: ()=> ({

  }),
  components: {
    "sub-forum": SubForum,
    "subscribes": Subscribes
  },
  mounted() {
  },
  methods: {

  },
}
</script>
