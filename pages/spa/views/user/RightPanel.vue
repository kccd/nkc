<template lang="pug">
  .hidden-sm.hidden-xs(v-if="forums" )
    sub-forum(:forums="forums")
    fans
    sub-user
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
</style>
<script>
import SubForum from "./userPanel/SubForum";
import SubUser from "./userPanel/SubUser";
import Fans from "./userPanel/Fans";
export default {
  props: ['forums', 'target-user'],
  data: ()=> ({

  }),
  components: {
    "sub-forum": SubForum,
    "sub-user": SubUser,
    "fans": Fans
  },
  mounted() {
  },
  methods: {

  },
}
</script>
